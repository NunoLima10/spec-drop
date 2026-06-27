import type { AppRouter } from "@specdrop/api";
import { createTRPCClient, httpBatchLink } from "@trpc/client";

export const trpc = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: "/trpc",
    }),
  ],
});
