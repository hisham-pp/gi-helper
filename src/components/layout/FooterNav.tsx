"use client";

import React from "react";
import { Info, MessageSquareHeart, ScrollText } from "lucide-react";
import { PillNav, type PillNavItem } from "./PillNav";

const FOOTER_ITEMS: PillNavItem[] = [
  { href: "/feedback", label: "Feedback", icon: MessageSquareHeart },
  { href: "/about", label: "About us", icon: Info },
  { href: "/versions", label: "Release notes", icon: ScrollText },
];

/** The footer's links as a pill like the top bar's (see PillNav). Icons from sm, so it fits phones. */
export function FooterNav() {
  return (
    <PillNav
      items={FOOTER_ITEMS}
      ariaLabel="Footer"
      className="grid w-full sm:inline-grid sm:w-auto"
      iconClassName="hidden sm:block"
    />
  );
}
