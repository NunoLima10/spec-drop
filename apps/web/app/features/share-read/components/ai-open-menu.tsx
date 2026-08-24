import { ChevronDownIcon, SparklesIcon } from "lucide-react";
import { DropdownMenu as DropdownMenuPrimitive } from "radix-ui";
import type { ReactNode } from "react";
import { Button } from "~/components/ui/button";
import { buildAiOpenUrl } from "../ai-open-links";
import { ChatGptLogo, ClaudeLogo } from "./provider-logos";

export function AiOpenMenu({ prompt }: { prompt: string }) {
  return (
    <DropdownMenuPrimitive.Root>
      <DropdownMenuPrimitive.Trigger asChild>
        <Button
          aria-label="Open page actions"
          className="h-9 border-[rgba(216,236,248,0.18)] bg-[#05060f]/70 px-3 text-[#d1e4fa] hover:bg-white/10 hover:text-white data-[state=open]:bg-white/10"
          size="sm"
          title="Open in"
          type="button"
          variant="outline"
        >
          <SparklesIcon aria-hidden="true" data-icon="inline-start" />
          Ask AI
          <ChevronDownIcon aria-hidden="true" data-icon="inline-end" />
        </Button>
      </DropdownMenuPrimitive.Trigger>
      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content
          align="start"
          className="z-50 min-w-48 rounded-lg border border-[rgba(216,236,248,0.16)] bg-[#111218] p-1 text-[#eef5ff] shadow-[0_18px_48px_rgba(0,0,0,0.36)]"
          sideOffset={6}
        >
          <AiOpenMenuLink
            href={buildAiOpenUrl("chatgpt", prompt)}
            icon={<ChatGptLogo className="size-4 text-[#eef5ff]" />}
          >
            ChatGPT
          </AiOpenMenuLink>
          <AiOpenMenuLink
            href={buildAiOpenUrl("claude", prompt)}
            icon={<ClaudeLogo className="size-4" />}
          >
            Claude
          </AiOpenMenuLink>
        </DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Root>
  );
}

function AiOpenMenuLink({
  children,
  href,
  icon,
}: {
  children: ReactNode;
  href: string;
  icon: ReactNode;
}) {
  return (
    <DropdownMenuPrimitive.Item asChild>
      <a
        className="flex cursor-default items-center gap-2 rounded-md px-2.5 py-2 text-sm outline-none select-none focus:bg-white/10"
        href={href}
        rel="noopener noreferrer"
        target="_blank"
      >
        {icon}
        {children}
      </a>
    </DropdownMenuPrimitive.Item>
  );
}
