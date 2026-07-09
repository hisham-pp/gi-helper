"use client";

import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

import { ItemCard } from "@/components/ui/item-card";
import { cn } from "@/lib/utils";

interface ItemData {
  id: string;
  name: string;
  image: string;
  rarity: number;
  element?: string;
  weaponType?: string;
  category?: string;
}

interface MarkdownProps {
  children: string;
  className?: string;
  itemData?: {
    characters: Map<string, ItemData>;
    weapons: Map<string, ItemData>;
    materials: Map<string, ItemData>;
  };
}

/**
 * Themed Markdown renderer for AI assistant output. Element styles are applied
 * per-node so we don't need the Tailwind typography plugin, and everything
 * stays on the app's MD3 color tokens in light and dark mode.
 */

// Parse item references like [character:albedo] or [material:grain-of-aerosiderite]
function parseItemReferences(text: string): string {
  // Replace [type:id] with a custom markdown syntax that we can render
  return text.replace(
    /\[(character|weapon|material):([a-z0-9-]+)\]/gi,
    (match, type, id) => {
      return `::item:${type}:${id}::`;
    },
  );
}

// Custom text renderer to handle item references
function renderTextWithItems(
  text: string,
  itemData?: MarkdownProps["itemData"],
): React.ReactNode {
  if (!text) return text;

  const parts = text.split(/::item:(character|weapon|material):([a-z0-9-]+)::/i);
  
  if (parts.length === 1) {
    return text;
  }

  const result: React.ReactNode[] = [];
  for (let i = 0; i < parts.length; i++) {
    if (i % 3 === 0) {
      // Regular text
      if (parts[i]) {
        result.push(parts[i]);
      }
    } else if (i % 3 === 1) {
      // Type
      const type = parts[i];
      const id = parts[i + 1];
      result.push(
        <ItemReference
          key={`${type}-${id}`}
          type={type as "character" | "weapon" | "material"}
          id={id}
          itemData={itemData}
        />,
      );
      i++; // Skip the id part
    }
  }

  return result;
}

function ItemReference({
  type,
  id,
  itemData,
}: {
  type: "character" | "weapon" | "material";
  id: string;
  itemData?: MarkdownProps["itemData"];
}) {
  const getItemData = (): ItemData => {
    if (!itemData) {
      return {
        id,
        name: id,
        image: "",
        rarity: 4,
        element: type === "character" ? "Pyro" : undefined,
        weaponType: type === "weapon" ? "Sword" : undefined,
        category: type === "material" ? "Material" : undefined,
      };
    }

    const map =
      type === "character"
        ? itemData.characters
        : type === "weapon"
          ? itemData.weapons
          : itemData.materials;

    const data = map.get(id);
    if (data) {
      return data;
    }

    // Fallback to placeholder
    return {
      id,
      name: id,
      image: "",
      rarity: 4,
      element: type === "character" ? "Pyro" : undefined,
      weaponType: type === "weapon" ? "Sword" : undefined,
      category: type === "material" ? "Material" : undefined,
    };
  };

  const data = getItemData();

  return (
    <ItemCard
      type={type}
      id={id}
      name={data.name}
      image={data.image}
      rarity={data.rarity}
      element={data.element}
      weaponType={data.weaponType}
      category={data.category}
    />
  );
}

const getMarkdownComponents = (itemData?: MarkdownProps["itemData"]): Components => ({
  p: ({ children }) => (
    <p className="my-2 first:mt-0 last:mb-0">{renderTextWithItems(String(children), itemData)}</p>
  ),
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
  li: ({ children }) => <li className="leading-relaxed">{renderTextWithItems(String(children), itemData)}</li>,
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
    <td className="border border-outline-variant px-2 py-1">{renderTextWithItems(String(children), itemData)}</td>
  ),
});

export function Markdown({ children, className, itemData }: MarkdownProps) {
  const processedContent = parseItemReferences(children);
  
  return (
    <div className={cn("text-sm leading-relaxed", className)}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={getMarkdownComponents(itemData)}>
        {processedContent}
      </ReactMarkdown>
    </div>
  );
}
