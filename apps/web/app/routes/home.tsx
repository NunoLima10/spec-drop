import { ShareCreatePage } from "~/features/share-create/containers/share-create-page";
import type { Route } from "./+types/home";

export function meta(_: Route.MetaArgs) {
  return [
    { title: "SpecsDrop" },
    {
      name: "description",
      content: "Publish Markdown specs as shareable web pages.",
    },
  ];
}

export default function Home() {
  return <ShareCreatePage />;
}
