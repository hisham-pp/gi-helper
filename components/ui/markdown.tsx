"use client";

import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

import { cn } from "@/lib/utils";

/**
 * Themed Markdown renderer for AI assistant output. Element styles are applied
 * per-node so we don't need the Tailwind typography plugin, and everything
 * stays on the app's MD3 color tokens in light and dark mode.
 */
const components: Components = {
  p: ({ children }) => <p className="my-2 first:mt-0 last:mb-0">{children}</p>,
  strong: ({ children }) => (
    <strong className="text-on-surface font-bold">{children}</strong>
  ),
  em: ({ children }) => <em className="italic">{children}</em>,
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="font-medium text-primary underline underline-offset-2"
    >
      {children}
    </a>
  ),
  ul: ({ children }) => (
    <ul className="my-2 list-disc space-y-1 pl-5">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="my-2 list-decimal space-y-1 pl-5">{children}</ol>
  ),
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  h1: ({ children }) => (
    <h1 className="mb-2 mt-3 text-base font-black first:mt-0">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="mb-2 mt-3 text-sm font-black first:mt-0">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="mb-1 mt-2 text-sm font-bold first:mt-0">{children}</h3>
  ),
  blockquote: ({ children }) => (
    <blockquote className="text-on-surface-variant my-2 border-l-2 border-outline-variant pl-3 italic">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-3 border-outline-variant" />,
  code: ({ className, children }) => {
    const isBlock = className?.includes("language-");
    if (isBlock) {
      return (
        <code className="block whitespace-pre-wrap break-words font-mono text-xs">
          {children}
        </code>
      );
    }
    return (
      <code className="rounded bg-surface-variant px-1 py-0.5 font-mono text-[0.85em]">
        {children}
      </code>
    );
  },
  pre: ({ children }) => (
    <pre className="my-2 overflow-x-auto rounded-lg border border-outline-variant bg-surface-variant/50 p-3">
      {children}
    </pre>
  ),
  table: ({ children }) => (
    <div className="my-2 overflow-x-auto">
      <table className="w-full border-collapse text-xs">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border border-outline-variant px-2 py-1 text-left font-bold">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border border-outline-variant px-2 py-1">{children}</td>
  ),
};

export function Markdown({
  children,
  className,
}: Readonly<{ children: string; className?: string }>) {
  return (
    <div className={cn("text-sm leading-relaxed", className)}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {children}
      </ReactMarkdown>
    </div>
  );
}
