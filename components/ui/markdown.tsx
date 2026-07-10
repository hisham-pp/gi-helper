"use client";

import { Children, cloneElement, isValidElement, type ReactNode } from "react";
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

type ItemDataMaps = {
  characters: Map<string, ItemData>;
  weapons: Map<string, ItemData>;
  materials: Map<string, ItemData>;
};

interface MarkdownProps {
  children: string;
  className?: string;
  itemData?: ItemDataMaps;
}

/**
 * Themed Markdown renderer for AI assistant output. Element styles are applied
 * per-node so we don't need the Tailwind typography plugin, and everything
 * stays on the app's MD3 color tokens in light and dark mode.
 *
 * It also recognizes inline item references like [character:albedo] or
 * [material:grain-of-aerosiderite] and renders them as an ItemCard.
 */

const ITEM_REF_PATTERN = /\[(character|weapon|material):([a-z0-9-]+)\]/gi;

function resolveItemData(
  type: "character" | "weapon" | "material",
  id: string,
  itemData?: ItemDataMaps,
): ItemData {
  const map =
    type === "character"
      ? itemData?.characters
      : type === "weapon"
        ? itemData?.weapons
        : itemData?.materials;

  return (
    map?.get(id) ?? {
      id,
      name: id,
      image: "",
      rarity: 4,
    }
  );
}

/**
 * Splits a single plain-text string on item references, returning the
 * original string when there are none. Only ever called on actual string
 * nodes — never on React elements or arrays of mixed children, which is
 * what previously produced literal "[object Object]" text.
 */
function renderTextNode(
  text: string,
  itemData: ItemDataMaps | undefined,
  keyPrefix: string,
): ReactNode {
  if (!text || !ITEM_REF_PATTERN.test(text)) {
    return text;
  }
  ITEM_REF_PATTERN.lastIndex = 0;

  const parts = text.split(ITEM_REF_PATTERN);
  const nodes: ReactNode[] = [];

  for (let i = 0; i < parts.length; i += 3) {
    if (parts[i]) {
      nodes.push(parts[i]);
    }

    const type = parts[i + 1] as
      | "character"
      | "weapon"
      | "material"
      | undefined;
    const id = parts[i + 2];

    if (type && id) {
      const data = resolveItemData(type, id, itemData);
      nodes.push(
        <ItemCard
          key={`${keyPrefix}-${type}-${id}-${i}`}
          type={type}
          id={id}
          name={data.name}
          image={data.image}
          rarity={data.rarity}
          element={data.element}
          weaponType={data.weaponType}
          category={data.category}
        />,
      );
    }
  }

  return nodes;
}

/**
 * Recursively walks a node's children, only ever transforming plain string
 * nodes into text + ItemCard fragments. Existing React elements (bold,
 * links, inline code, etc.) are preserved as-is, recursing into their own
 * children so an item reference inside `**[character:albedo]**` still works.
 */
function renderChildrenWithItems(
  children: ReactNode,
  itemData: ItemDataMaps | undefined,
  keyPrefix = "n",
): ReactNode {
  return Children.map(children, (child, index) => {
    const key = `${keyPrefix}-${index}`;

    if (typeof child === "string") {
      return renderTextNode(child, itemData, key);
    }

    if (
      isValidElement<{ children?: ReactNode }>(child) &&
      child.props?.children !== undefined
    ) {
      return cloneElement(child, {
        children: renderChildrenWithItems(child.props.children, itemData, key),
      } as Partial<{ children?: ReactNode }>);
    }

    return child;
  });
}

const getMarkdownComponents = (itemData?: ItemDataMaps): Components => ({
  p: ({ children }) => (
    <p className="my-2 first:mt-0 last:mb-0">
      {renderChildrenWithItems(children, itemData, "p")}
    </p>
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
  li: ({ children }) => (
    <li className="leading-relaxed">
      {renderChildrenWithItems(children, itemData, "li")}
    </li>
  ),
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
    <td className="border border-outline-variant px-2 py-1">
      {renderChildrenWithItems(children, itemData, "td")}
    </td>
  ),
});

export function Markdown({ children, className, itemData }: MarkdownProps) {
  return (
    <div className={cn("text-sm leading-relaxed", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={getMarkdownComponents(itemData)}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
