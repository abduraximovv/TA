"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@repo/auth";
import { subscribeToBookingUpdates } from "@repo/database";
import { Toast } from "@repo/ui";

export function RealtimeNotifications() {
  const { user, role } = useAuth();
  const [toastMessage, setToastMessage] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const [toastVariant, setToastVariant] = useState<"success" | "danger" | "default">("default");

  useEffect(() => {
    if (!user || role !== "tourist") return;

    const sub = subscribeToBookingUpdates(user.id, "tourist", (payload) => {
      const newStatus = payload.new.status;
      
      if (newStatus === "accepted") {
        setToastMessage(`Your booking has been accepted!`);
        setToastVariant("success");
        setToastVisible(true);
      } else if (newStatus === "declined") {
        setToastMessage(`Your booking was declined.`);
        setToastVariant("danger");
        setToastVisible(true);
      }
    });

    return () => {
      sub.unsubscribe();
    };
  }, [user, role]);

  return (
    <Toast 
      message={toastMessage}
      isVisible={toastVisible}
      onClose={() => setToastVisible(false)}
      variant={toastVariant}
    />
  );
}
