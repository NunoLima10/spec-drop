import { publicProcedure, router } from "../../trpc.js";
import { sharesController } from "./shares-controller.js";
import {
  createShareInputSchema,
  shareSlugInputSchema,
} from "./shares-schema.js";

export const shareRouter = router({
  create: publicProcedure
    .input(createShareInputSchema)
    .mutation(({ ctx, input }) => sharesController.create(ctx, input)),

  bySlug: publicProcedure
    .input(shareSlugInputSchema)
    .query(({ ctx, input }) => sharesController.bySlug(ctx, input)),

  delete: publicProcedure
    .input(shareSlugInputSchema)
    .mutation(({ ctx, input }) => sharesController.delete(ctx, input)),
});
