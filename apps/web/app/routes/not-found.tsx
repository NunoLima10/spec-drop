import { StatusPage } from "~/components/status-page";

export function meta() {
  return [
    { title: "Page not found | SpecsDrop" },
    {
      name: "description",
      content: "This SpecsDrop page does not exist.",
    },
  ];
}

export default function NotFound() {
  return (
    <StatusPage
      description="This URL does not point to a published Markdown document or app route. Create a fresh share from the upload flow, or check the link for a missing slug."
      statusCode="404"
      title="No Markdown lives at this address."
      variant="not-found"
    />
  );
}
