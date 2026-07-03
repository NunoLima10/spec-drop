import type { ReactNode } from "react";
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRouteError,
} from "react-router";
import { StatusPage } from "~/components/status-page";
import "./app.css";

export function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    const isNotFound = error.status === 404;

    return (
      <StatusPage
        description={
          isNotFound
            ? "That SpecsDrop route does not exist. Start a new Markdown handoff or check the URL for a missing share slug."
            : error.statusText ||
              "The route failed before SpecsDrop could render the document."
        }
        statusCode={`${error.status}`}
        title={
          isNotFound ? "Nothing is published here." : "This page hit an error."
        }
        variant={isNotFound ? "not-found" : "error"}
      />
    );
  }

  return (
    <StatusPage
      description={
        error instanceof Error
          ? error.message
          : "SpecsDrop could not render this page. You can retry the request or return to the upload flow."
      }
      onRetry={() => window.location.reload()}
      statusCode="500"
      title="The document handoff stalled."
      variant="error"
    />
  );
}
