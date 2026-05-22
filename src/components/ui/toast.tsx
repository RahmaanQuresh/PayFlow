"use client";

import { Toaster as Sonner } from "sonner";

export function Toaster() {
  return (
    <Sonner
      position="bottom-right"
      toastOptions={{
        style: {
          fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
          border: "2px solid #1E293B",
          borderRadius: "16px",
          fontWeight: "700",
          boxShadow: "4px 4px 0px 0px #1E293B",
          backgroundColor: "#FFFFFF",
          color: "#1E293B",
        },
      }}
    />
  );
}
