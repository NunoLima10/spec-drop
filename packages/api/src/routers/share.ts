import type { DB } from "@specdrop/db";
import { schema } from "@specdrop/db";
import { validateMarkdownContent } from "@specdrop/markdown";
import { TRPCError } from "@trpc/server";
import { and, eq, isNull, lte, sql } from "drizzle-orm";
import { z } from "zod";
import { publicProcedure, router } from "../trpc.js";

const slugAlphabet =
  "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

function createSlug(length = 10): string {
  const values = new Uint8Array(length);
  crypto.getRandomValues(values);

  return Array.from(
    values,
    (value) => slugAlphabet[value % slugAlphabet.length],
  ).join("");
}

function createShareUrl(origin: string, slug: string): string {
  return new URL(`/s/${slug}`, origin).toString();
}

const expirationDurations = {
  never: null,
  "1h": 60 * 60 * 1000,
  "24h": 24 * 60 * 60 * 1000,
  "7d": 7 * 24 * 60 * 60 * 1000,
  "30d": 30 * 24 * 60 * 60 * 1000,
} as const;

const expirationOptionSchema = z
  .enum(["never", "1h", "24h", "7d", "30d"])
  .default("never");

const createShareInput = z.object({
  title: z.string().trim().max(120).optional(),
  content: z.string(),
  expiresIn: expirationOptionSchema,
  deleteAfterRead: z.boolean().default(false),
  maxViews: z.number().int().min(1).max(10_000).optional().nullable(),
});

const createShareFailureMessage = "Could not create a share. Please try again.";

function isUniqueSlugError(error: unknown): boolean {
  return (
    error instanceof Error &&
    error.message.includes("shares.slug") &&
    error.message.toLowerCase().includes("unique")
  );
}

type ShareRecord = typeof schema.shares.$inferSelect;

export function getExpiresAt(
  expiresIn: z.infer<typeof expirationOptionSchema>,
  now = new Date(),
): string | null {
  const duration = expirationDurations[expiresIn];

  if (duration === null) {
    return null;
  }

  return new Date(now.getTime() + duration).toISOString();
}

export function getUnavailableShareMessage(
  share: Pick<
    ShareRecord,
    | "deletedAt"
    | "expiresAt"
    | "deleteAfterRead"
    | "readAt"
    | "maxViews"
    | "currentViews"
  >,
  now = new Date(),
): string | null {
  if (share.deletedAt) {
    return "Share was deleted.";
  }

  if (share.expiresAt && new Date(share.expiresAt) <= now) {
    return "Share has expired.";
  }

  if (share.deleteAfterRead && share.readAt) {
    return "Share was deleted after its first view.";
  }

  if (share.maxViews !== null && share.currentViews >= share.maxViews) {
    return "Share view limit reached.";
  }

  return null;
}

export function getShareViewUpdate(
  share: Pick<
    ShareRecord,
    "readAt" | "deleteAfterRead" | "maxViews" | "currentViews"
  >,
  now = new Date(),
) {
  const viewedAt = now.toISOString();
  const nextViews = share.currentViews + 1;
  const shouldSoftDelete =
    share.deleteAfterRead ||
    (share.maxViews !== null && nextViews >= share.maxViews);

  return {
    currentViews: nextViews,
    readAt: share.readAt ?? viewedAt,
    deletedAt: shouldSoftDelete ? viewedAt : null,
  };
}

export async function cleanupExpiredShares(db: DB, now = new Date()) {
  const deletedShares = await db
    .update(schema.shares)
    .set({ deletedAt: now.toISOString() })
    .where(
      and(
        isNull(schema.shares.deletedAt),
        lte(schema.shares.expiresAt, now.toISOString()),
      ),
    )
    .returning({ id: schema.shares.id });

  return {
    deletedCount: deletedShares.length,
  };
}

export const shareRouter = router({
  create: publicProcedure
    .input(createShareInput)
    .mutation(async ({ ctx, input }) => {
      let content: string;

      try {
        content = validateMarkdownContent(input.content);
      } catch (error) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            error instanceof Error
              ? error.message
              : "Markdown content is invalid.",
        });
      }

      const title = input.title || null;
      const id = crypto.randomUUID();
      const expiresAt = getExpiresAt(input.expiresIn);
      const maxViews = input.maxViews ?? null;

      for (let attempt = 0; attempt < 5; attempt += 1) {
        const slug = createSlug();

        try {
          await ctx.db.insert(schema.shares).values({
            id,
            slug,
            title,
            content,
            expiresAt,
            deleteAfterRead: input.deleteAfterRead,
            maxViews,
          });

          return {
            slug,
            url: createShareUrl(ctx.origin, slug),
            title,
            expiresAt,
            deleteAfterRead: input.deleteAfterRead,
            maxViews,
          };
        } catch (error) {
          if (!isUniqueSlugError(error)) {
            console.error("Failed to create share", error);

            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: createShareFailureMessage,
              cause: error,
            });
          }

          if (attempt === 4) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: createShareFailureMessage,
              cause: error,
            });
          }
        }
      }

      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: createShareFailureMessage,
      });
    }),

  bySlug: publicProcedure
    .input(z.object({ slug: z.string().min(1).max(64) }))
    .query(async ({ ctx, input }) => {
      const share = await ctx.db.query.shares.findFirst({
        where: eq(schema.shares.slug, input.slug),
      });

      if (!share || share.deletedAt) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Share not found.",
        });
      }

      const now = new Date();
      const unavailableMessage = getUnavailableShareMessage(share, now);

      if (unavailableMessage) {
        if (!share.deletedAt && unavailableMessage !== "Share was deleted.") {
          await ctx.db
            .update(schema.shares)
            .set({ deletedAt: now.toISOString() })
            .where(eq(schema.shares.id, share.id));
        }

        throw new TRPCError({
          code: "NOT_FOUND",
          message: unavailableMessage,
        });
      }

      const viewUpdate = getShareViewUpdate(share, now);

      await ctx.db
        .update(schema.shares)
        .set({
          currentViews: sql`${schema.shares.currentViews} + 1`,
          readAt: viewUpdate.readAt,
          deletedAt: viewUpdate.deletedAt,
        })
        .where(eq(schema.shares.id, share.id));

      return {
        slug: share.slug,
        title: share.title,
        content: share.content,
        createdAt: share.createdAt,
        expiresAt: share.expiresAt,
        deleteAfterRead: share.deleteAfterRead,
        maxViews: share.maxViews,
        currentViews: viewUpdate.currentViews,
      };
    }),

  delete: publicProcedure
    .input(z.object({ slug: z.string().min(1).max(64) }))
    .mutation(async ({ ctx, input }) => {
      const share = await ctx.db.query.shares.findFirst({
        where: eq(schema.shares.slug, input.slug),
      });

      if (!share || share.deletedAt) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Share not found.",
        });
      }

      const deletedAt = new Date().toISOString();

      await ctx.db
        .update(schema.shares)
        .set({ deletedAt })
        .where(eq(schema.shares.id, share.id));

      return {
        slug: share.slug,
        deletedAt,
      };
    }),
});
