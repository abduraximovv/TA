"use client";

import * as React from "react";
import { Card } from "./Card";

export interface AuthCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export function AuthCard({ title, subtitle, children }: AuthCardProps) {
  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gray-50" data-testid="login-page">
      <Card className="w-full max-w-md p-8 border border-gray-200 bg-white shadow-sm rounded-lg transition-all duration-200 hover:shadow-md">
        <div className="flex flex-col gap-2 text-center mb-6">
          <h1 className="text-2xl font-display font-semibold tracking-tight text-gray-900">{title}</h1>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
        {children}
      </Card>
    </div>
  );
}
