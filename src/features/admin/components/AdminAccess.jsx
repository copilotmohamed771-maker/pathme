"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import {
  AUTH_SESSION_EVENT,
  getAuthUser,
  hasAuthSession,
} from "@/lib/api";
import { hasAdminRole } from "../api";
import { AdminDashboard } from "./AdminDashboard";

function subscribeToAuth(onChange) {
  window.addEventListener(AUTH_SESSION_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(AUTH_SESSION_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

function getAdminAccessSnapshot() {
  return hasAuthSession() && hasAdminRole(getAuthUser());
}

export function AdminAccess() {
  const router = useRouter();
  const authorized = useSyncExternalStore(
    subscribeToAuth,
    getAdminAccessSnapshot,
    () => false,
  );

  useEffect(() => {
    if (!authorized) router.replace("/admin/login");
  }, [authorized, router]);

  if (!authorized) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm font-semibold text-slate-500" role="status">
          Verifying administrator access...
        </p>
      </main>
    );
  }

  return <AdminDashboard />;
}
