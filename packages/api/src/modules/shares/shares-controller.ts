import type { ApiContext } from "../../trpc.js";
import { mapShareServiceErrors, throwShareNotFound } from "./shares-errors.js";
import type { CreateShareInput, ShareSlugInput } from "./shares-schema.js";
import {
  createShare,
  deleteShareBySlug,
  readShareBySlug,
} from "./shares-service.js";
import { createShareUrl } from "./shares-url.js";

async function create(ctx: ApiContext, input: CreateShareInput) {
  const share = await mapShareServiceErrors(() => createShare(ctx.db, input));

  return {
    ...share,
    url: createShareUrl(ctx.origin, share.slug),
  };
}

async function bySlug(ctx: ApiContext, input: ShareSlugInput) {
  const result = await readShareBySlug(ctx.db, input.slug);

  if (result.status === "not_found") {
    throwShareNotFound(result);
  }

  return result.share;
}

async function remove(ctx: ApiContext, input: ShareSlugInput) {
  const result = await deleteShareBySlug(ctx.db, input.slug);

  if (result.status === "not_found") {
    throwShareNotFound(result);
  }

  return result.share;
}

export const sharesController = {
  create,
  bySlug,
  delete: remove,
};
