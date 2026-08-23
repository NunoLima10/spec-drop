import { z } from "zod";

export const expirationOptions = ["never", "1h", "24h", "7d", "30d"] as const;

export const expirationOptionSchema = z
  .enum(expirationOptions)
  .default("never");

export type ExpirationOption = (typeof expirationOptions)[number];

export const expirationDurations = {
  never: null,
  "1h": 60 * 60 * 1000,
  "24h": 24 * 60 * 60 * 1000,
  "7d": 7 * 24 * 60 * 60 * 1000,
  "30d": 30 * 24 * 60 * 60 * 1000,
} as const satisfies Record<ExpirationOption, number | null>;

export const createShareInputSchema = z.object({
  title: z.string().trim().max(120).optional(),
  content: z.string(),
  expiresIn: expirationOptionSchema,
  deleteAfterRead: z.boolean().default(false),
  maxViews: z.number().int().min(1).max(10_000).optional().nullable(),
});

export const shareSlugInputSchema = z.object({
  slug: z.string().min(1).max(64),
});

export type CreateShareInput = z.infer<typeof createShareInputSchema>;
export type ShareSlugInput = z.infer<typeof shareSlugInputSchema>;
