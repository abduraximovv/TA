"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SafronCoordinator } from "@/components/coordinator/SafronCoordinator";

export default function CoordinatorPage() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    document.title = "AI Travel Coordinator — Safron";
    setIsOpen(true);
  }, []);

  return (
    <SafronCoordinator
      isOpen={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) router.back();
      }}
    />
  );
}
