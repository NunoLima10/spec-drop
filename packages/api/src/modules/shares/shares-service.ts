import type { DB } from "@specdrop/db";
import { schema } from "@specdrop/db";
import { and, eq, isNull, lte, sql } from "drizzle-orm";
import { ShareCreateFailureError } from "./shares-errors.js";
import {
  createSlug,
  getExpiresAt,
  getShareViewUpdate,
  getUnavailableShareMessage,
  resolveShareTitle,
  shouldExposeSharePreviewTitle,
  validateShareContent,
} from "./shares-lib.js";
import type { CreateShareInput } from "./shares-schema.js";

const maxCreateShareAttempts = 5;

function isUniqueSlugError(error: unknown): boolean {
  return (
    error instanceof Error &&
    error.message.includes("shares.slug") &&
    error.message.toLowerCase().includes("unique")
  );
}

function shareNotFound(message = "Share not found.") {
  return {
    status: "not_found" as const,
    message,
  };
}

function findShareBySlug(db: DB, slug: string) {
  return db.query.shares.findFirst({
    where: eq(schema.shares.slug, slug),
  });
}

async function softDeleteShare(db: DB, id: string, deletedAt: string) {
  await db
    .update(schema.shares)
    .set({ deletedAt })
    .where(eq(schema.shares.id, id));
}

export async function createShare(
  db: DB,
  input: CreateShareInput,
  now = new Date(),
) {
  const content = validateShareContent(input.content);
  const title = resolveShareTitle({ title: input.title, content });
  const id = crypto.randomUUID();
  const expiresAt = getExpiresAt(input.expiresIn, now);
  const maxViews = input.maxViews ?? null;

  for (let attempt = 0; attempt < maxCreateShareAttempts; attempt += 1) {
    const slug = createSlug();

    try {
      await db.insert(schema.shares).values({
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
        title,
        expiresAt,
        deleteAfterRead: input.deleteAfterRead,
        maxViews,
      };
    } catch (error) {
      if (!isUniqueSlugError(error)) {
        throw new ShareCreateFailureError({ cause: error });
      }

      if (attempt === maxCreateShareAttempts - 1) {
        throw new ShareCreateFailureError({ cause: error });
      }
    }
  }

  throw new ShareCreateFailureError();
}

export async function getSharePreviewBySlug(
  db: DB,
  slug: string,
  now = new Date(),
) {
  const share = await db.query.shares.findFirst({
    columns: {
      title: true,
      content: true,
      deletedAt: true,
      expiresAt: true,
      deleteAfterRead: true,
      readAt: true,
      maxViews: true,
      currentViews: true,
    },
    where: eq(schema.shares.slug, slug),
  });

  if (!share || getUnavailableShareMessage(share, now)) {
    return null;
  }

  return {
    title: shouldExposeSharePreviewTitle(share)
      ? resolveShareTitle({
          title: share.title,
          content: share.content,
        })
      : null,
  };
}

export async function readShareBySlug(db: DB, slug: string, now = new Date()) {
  const share = await findShareBySlug(db, slug);

  if (!share || share.deletedAt) {
    return shareNotFound();
  }

  const unavailableMessage = getUnavailableShareMessage(share, now);

  if (unavailableMessage) {
    if (!share.deletedAt && unavailableMessage !== "Share was deleted.") {
      await softDeleteShare(db, share.id, now.toISOString());
    }

    return shareNotFound(unavailableMessage);
  }

  const viewUpdate = getShareViewUpdate(share, now);

  await db
    .update(schema.shares)
    .set({
      currentViews: sql`${schema.shares.currentViews} + 1`,
      readAt: viewUpdate.readAt,
      deletedAt: viewUpdate.deletedAt,
    })
    .where(eq(schema.shares.id, share.id));

  return {
    status: "ready" as const,
    share: {
      slug: share.slug,
      title: share.title,
      content: share.content,
      createdAt: share.createdAt,
      expiresAt: share.expiresAt,
      deleteAfterRead: share.deleteAfterRead,
      maxViews: share.maxViews,
      currentViews: viewUpdate.currentViews,
    },
  };
}

export async function deleteShareBySlug(
  db: DB,
  slug: string,
  now = new Date(),
) {
  const share = await findShareBySlug(db, slug);

  if (!share || share.deletedAt) {
    return shareNotFound();
  }

  const deletedAt = now.toISOString();

  await softDeleteShare(db, share.id, deletedAt);

  return {
    status: "deleted" as const,
    share: {
      slug: share.slug,
      deletedAt,
    },
  };
}

export async function cleanupExpiredShares(db: DB, now = new Date()) {
  const deletedAt = now.toISOString();
  const deletedShares = await db
    .update(schema.shares)
    .set({ deletedAt })
    .where(
      and(
        isNull(schema.shares.deletedAt),
        lte(schema.shares.expiresAt, deletedAt),
      ),
    )
    .returning({ id: schema.shares.id });

  return {
    deletedCount: deletedShares.length,
  };
}
