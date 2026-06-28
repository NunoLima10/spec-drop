import { schema } from "@specdrop/db";
import { validateMarkdownContent } from "@specdrop/markdown";
import { TRPCError } from "@trpc/server";
import { eq, sql } from "drizzle-orm";
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

const createShareInput = z.object({
  title: z.string().trim().max(120).optional(),
  content: z.string(),
});

function isUniqueSlugError(error: unknown): boolean {
  return (
    error instanceof Error &&
    error.message.includes("shares.slug") &&
    error.message.toLowerCase().includes("unique")
  );
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

      for (let attempt = 0; attempt < 5; attempt += 1) {
        const slug = createSlug();

        try {
          await ctx.db.insert(schema.shares).values({
            id,
            slug,
            title,
            content,
          });

          return {
            slug,
            url: createShareUrl(ctx.origin, slug),
            title,
          };
        } catch (error) {
          if (!isUniqueSlugError(error)) {
            console.error("Failed to create share", error);

            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message:
                error instanceof Error
                  ? error.message
                  : "Could not create a share. Please try again.",
              cause: error,
            });
          }

          if (attempt === 4) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Could not create a share. Please try again.",
              cause: error,
            });
          }
        }
      }

      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Could not create a share. Please try again.",
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

      if (share.expiresAt && new Date(share.expiresAt) <= new Date()) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Share has expired.",
        });
      }

      await ctx.db
        .update(schema.shares)
        .set({
          currentViews: sql`${schema.shares.currentViews} + 1`,
          readAt: share.readAt ?? new Date().toISOString(),
        })
        .where(eq(schema.shares.id, share.id));

      return {
        slug: share.slug,
        title: share.title,
        content: share.content,
        createdAt: share.createdAt,
      };
    }),
});
