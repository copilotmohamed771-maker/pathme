"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "@/components/ui/Logo";
import {
  apiRequest,
  clearAuthSession,
  getAuthUser,
  hasAuthSession,
  saveAuthSession,
} from "@/lib/api";
import { getAuthUserFromResult, hasAdminRole } from "../api";

export function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (hasAuthSession() && hasAdminRole(getAuthUser())) {
      router.replace("/admin");
    }
  }, [router]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const username = String(formData.get("username") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    clearAuthSession();
    try {
      const authResult = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });

      if (!hasAdminRole(getAuthUserFromResult(authResult))) {
        setError("This account does not have administrator access.");
        return;
      }

      saveAuthSession(authResult);
      router.replace("/admin");
    } catch (requestError) {
      setError(requestError.message || "Could not sign in. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-4 py-10">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 -top-40 h-96 w-96 rounded-full bg-brand-innovation/15 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 -right-24 h-96 w-96 rounded-full bg-brand-primary/10 blur-3xl"
      />

      <div className="relative w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Logo showTagline />
        </div>

        <section className="rounded-3xl border border-white bg-white p-7 shadow-[0_28px_90px_-35px_rgba(16,24,47,0.25)] sm:p-9">
          <div className="mb-7 text-center">
            <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-primary text-xl text-white shadow-lg shadow-brand-primary/20">
              <i className="fa-solid fa-shield-halved" aria-hidden="true" />
            </span>
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-brand-innovation">
              Secure workspace
            </p>
            <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-brand-dark">
              Administrator sign in
            </h1>
            <p className="mt-2 text-sm leading-6 text-gray-500">
              Sign in with your administrator username and password.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="admin-username"
                className="mb-2 block text-sm font-bold text-brand-dark"
              >
                Username
              </label>
              <div className="relative">
                <i
                  className="fa-regular fa-user pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  aria-hidden="true"
                />
                <input
                  id="admin-username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  autoCapitalize="none"
                  spellCheck={false}
                  required
                  placeholder="Enter your username"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3.5 pl-11 pr-4 text-sm text-brand-dark outline-none transition placeholder:text-gray-400 focus:border-brand-innovation focus:bg-white focus:ring-4 focus:ring-brand-innovation/10"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="admin-password"
                className="mb-2 block text-sm font-bold text-brand-dark"
              >
                Password
              </label>
              <div className="relative">
                <i
                  className="fa-solid fa-lock pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  aria-hidden="true"
                />
                <input
                  id="admin-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  placeholder="Enter your password"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3.5 pl-11 pr-12 text-sm text-brand-dark outline-none transition placeholder:text-gray-400 focus:border-brand-innovation focus:bg-white focus:ring-4 focus:ring-brand-innovation/10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-brand-dark"
                >
                  <i
                    className={`fa-regular ${showPassword ? "fa-eye-slash" : "fa-eye"}`}
                    aria-hidden="true"
                  />
                </button>
              </div>
            </div>

            {error && (
              <p
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-primary px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-brand-primary/15 transition hover:bg-blue-900 disabled:cursor-wait disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <i className="fa-solid fa-spinner animate-spin" aria-hidden="true" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign in to dashboard
                  <i className="fa-solid fa-arrow-right" aria-hidden="true" />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-gray-500">
            Not an administrator?{" "}
            <Link
              href="/login"
              className="font-bold text-brand-primary transition hover:text-brand-innovation"
            >
              Go to regular sign in
            </Link>
          </p>
        </section>
        <p className="mt-5 text-center text-xs text-gray-400">
          Protected admin area · PathMe
        </p>
      </div>
    </main>
  );
}
