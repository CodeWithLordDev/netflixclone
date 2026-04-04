"use client";

import { AuthProvider } from "@/context/auth-context";
import { ToastProvider } from "@/components/ui/toast";

export default function AppProviders({ children }) {
  return (
    <ToastProvider>
      <AuthProvider>{children}</AuthProvider>
    </ToastProvider>
  );
}
