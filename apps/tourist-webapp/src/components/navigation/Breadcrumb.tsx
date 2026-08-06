"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  /** Use light text -- for breadcrumbs overlaid on a photo/dark hero instead of a plain background. */
  light?: boolean;
  style?: React.CSSProperties;
}

export function Breadcrumb({ items, light, style }: BreadcrumbProps) {
  const all: BreadcrumbItem[] = [{ label: "Home", href: "/" }, ...items];
  const mutedColor = light ? "rgba(249,248,245,0.7)" : "rgba(10,35,32,0.55)";
  const currentColor = light ? "#FFFFFF" : "#0A2320";

  return (
    <nav
      aria-label="Breadcrumb"
      style={{
        display: "flex",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 6,
        fontFamily: "'Inter', sans-serif",
        fontSize: 13,
        padding: "20px 0 0",
        ...style,
      }}
    >
      {all.map((item, i) => {
        const isLast = i === all.length - 1;
        return (
          <React.Fragment key={`${item.label}-${i}`}>
            {i > 0 && <ChevronRight size={12} color={light ? "rgba(249,248,245,0.4)" : "rgba(10,35,32,0.35)"} />}
            {isLast || !item.href ? (
              <span style={{ color: currentColor, fontWeight: 600 }}>{item.label}</span>
            ) : (
              <Link href={item.href} style={{ color: mutedColor, textDecoration: "none", fontWeight: 500 }}>
                {item.label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
