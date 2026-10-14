import React from "react";
import Link from "next/link";
import { LinkPendingReporter } from "./PageShellSlot";

/**
 * next/link that tells PageShellSlot while its page is really loading, so the
 * page's skeleton shows in the meantime. Use it for links between the public
 * pages. Works in server and client components.
 *
 * Prefetches the whole page (prefetch={true}) once the link is on screen and
 * again on hover/touch, so most clicks switch instantly with no shell.
 */
export function ShellLink({ children, prefetch = true, ...props }: React.ComponentProps<typeof Link>) {
  return (
    <Link prefetch={prefetch} {...props}>
      {children}
      <LinkPendingReporter href={String(props.href)} />
    </Link>
  );
}
