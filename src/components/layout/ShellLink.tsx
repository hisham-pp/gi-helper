"use client";

import React, { useSyncExternalStore } from "react";
import Link from "next/link";
import { LinkPendingReporter } from "./PageShellSlot";

function subscribeOnline(callback: () => void) {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

function getOnlineSnapshot(): boolean {
  return typeof navigator !== "undefined" ? navigator.onLine : true;
}

function getServerOnlineSnapshot(): boolean {
  return true;
}

/**
 * next/link that tells PageShellSlot while its page is really loading, so the
 * page's skeleton shows in the meantime. Use it for links between the public
 * pages. Works in server and client components.
 *
 * Prefetches the whole page (prefetch={true}) once the link is on screen and
 * again on hover/touch, so most clicks switch instantly with no shell.
 *
 * When offline, falls back to native document navigation so the Service Worker
 * can serve the pre-cached HTML shell and static assets without next/link throwing
 * an uncaught RSC client exception.
 */
export function ShellLink({ children, prefetch = true, ...props }: React.ComponentProps<typeof Link>) {
  const isOnline = useSyncExternalStore(subscribeOnline, getOnlineSnapshot, getServerOnlineSnapshot);

  if (!isOnline) {
    const { href, className, style, title, onClick, ...rest } = props;
    return (
      <a
        href={String(href)}
        className={className}
        style={style}
        title={title}
        onClick={onClick as React.MouseEventHandler<HTMLAnchorElement>}
        {...(rest as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        {children}
      </a>
    );
  }

  return (
    <Link prefetch={prefetch} {...props}>
      {children}
      <LinkPendingReporter href={String(props.href)} />
    </Link>
  );
}
