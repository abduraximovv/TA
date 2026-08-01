"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "../utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  // See UI_UX_GUIDELINES.md §6.1 for the canonical button variant spec.
  variant?: "default" | "secondary" | "outline" | "teal" | "ghost" | "danger" | "success";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-sm font-semibold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          {
            // Primary — Emerald bg, white text
            "bg-primary text-white hover:bg-primary-light": variant === "default",
            // Secondary — Gold bg, Emerald text (UI_UX_GUIDELINES §6.1)
            "bg-secondary text-primary hover:bg-secondary-dark": variant === "secondary",
            // Outline — transparent, Emerald border/text
            "bg-transparent border border-primary/30 text-primary hover:border-primary hover:bg-primary/5":
              variant === "outline",
            // Teal action — Turquoise bg, white text (e.g. "Go Online"-style positive actions)
            "bg-accent text-white hover:bg-accent/90": variant === "teal",
            "hover:bg-gray-100 hover:text-gray-900": variant === "ghost",
            "bg-error text-white hover:bg-red-600": variant === "danger",
            "bg-success text-white hover:bg-green-700": variant === "success",
            "h-10 px-4 py-2 text-sm": size === "default",
            "h-9 rounded-sm px-3 text-sm": size === "sm",
            "h-12 rounded-sm px-8 text-sm": size === "lg",
            "h-10 w-10": size === "icon",
          },
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
