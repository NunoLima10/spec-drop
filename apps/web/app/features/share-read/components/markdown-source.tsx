export function MarkdownSource({ content }: { content: string }) {
  return (
    <pre className="overflow-x-auto whitespace-pre-wrap break-words rounded-lg border border-[rgba(216,236,248,0.1)] bg-[rgba(2,6,23,0.82)] p-4 font-mono text-[#d8ecf8] text-sm leading-6">
      <code>{content}</code>
    </pre>
  );
}
