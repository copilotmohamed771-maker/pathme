"use client";

import Link from "next/link";
import { useEffect, useId, useState } from "react";
import { Logo } from "@/components/ui/Logo";
import {
  getResponseMessage,
  submitPasswordReset,
} from "@/features/auth/api";

export function ResetPasswordPage() {
  const newPasswordId = useId();
  const confirmPasswordId = useId();
  const [token, setToken] = useState("");
  const [tokenLoaded, setTokenLoaded] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      const url = new URL(window.location.href);
      const resetToken = url.searchParams.get("token") || "";
      url.searchParams.delete("token");
      window.history.replaceState(
        window.history.state,
        "",
        `${url.pathname}${url.search}${url.hash}`,
      );
      setToken(resetToken);
      setTokenLoaded(true);
    });

    return () => window.cancelAnimationFrame(frameId);
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Your password must be at least 8 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setError("The passwords do not match. Check both fields and try again.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await submitPasswordReset(token, password);
      setSuccessMessage(
        getResponseMessage(result) ||
          "Your password has been changed successfully. Please log in again.",
      );
      setPassword("");
      setConfirmPassword("");
    } catch (requestError) {
      setError(
        requestError.message ||
          "We couldn’t reset your password. Request a new link and try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="auth-card-enter w-full max-w-xl overflow-hidden rounded-[2rem] border border-white bg-white shadow-[0_28px_90px_-35px_rgba(16,24,47,0.28)]">
      <div className="relative overflow-hidden bg-gradient-to-br from-brand-primary via-[#263b7c] to-[#111b3a] px-6 py-8 text-white sm:px-10 sm:py-10">
        <div
          className="pointer-events-none absolute -right-10 -top-20 h-56 w-56 rounded-full border border-white/10"
          aria-hidden="true"
        />
        <div className="relative z-10">
          <Logo variant="dark" size="sm" />
          <div className="mt-8 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-xl text-brand-innovation">
            <i
              className={`fa-solid ${successMessage ? "fa-circle-check" : "fa-shield-keyhole"}`}
              aria-hidden="true"
            />
          </div>
          <p className="mt-5 text-xs font-extrabold uppercase tracking-[0.18em] text-teal-200">
            Account recovery
          </p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight sm:text-4xl">
            {successMessage ? "You’re all set." : "Create a new password"}
          </h1>
          <p className="mt-3 max-w-md text-sm leading-6 text-blue-100">
            {successMessage
              ? "Your account is ready for your next learning session."
              : "Choose a strong password you haven’t used for this account before."}
          </p>
        </div>
      </div>

      <div className="p-6 sm:p-10">
        {!tokenLoaded ? (
          <p
            role="status"
            className="flex items-center justify-center gap-2 py-8 text-sm font-semibold text-slate-500"
          >
            <i className="fa-solid fa-spinner animate-spin" aria-hidden="true" />
            Checking your reset link…
          </p>
        ) : !token ? (
          <div className="space-y-5 text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-xl text-amber-600">
              <i className="fa-solid fa-link-slash" aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-lg font-extrabold text-brand-dark">
                Invalid or missing link
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                This password reset link is incomplete. Request a new link to
                continue.
              </p>
            </div>
            <Link
              href="/login?forgot=1"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-primary px-5 py-3.5 text-sm font-extrabold text-white transition hover:-translate-y-0.5 hover:bg-[#1c3073]"
            >
              Request a new link
              <i className="fa-solid fa-arrow-right text-xs" aria-hidden="true" />
            </Link>
          </div>
        ) : successMessage ? (
          <div className="space-y-5">
            <p
              role="status"
              className="flex gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-900"
            >
              <i
                className="fa-solid fa-circle-check mt-1 text-emerald-600"
                aria-hidden="true"
              />
              <span>{successMessage}</span>
            </p>
            <Link
              href="/login"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-primary px-5 py-3.5 text-sm font-extrabold text-white transition hover:-translate-y-0.5 hover:bg-[#1c3073]"
            >
              Go to Login
              <i className="fa-solid fa-arrow-right text-xs" aria-hidden="true" />
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <PasswordField
              id={newPasswordId}
              label="New password"
              value={password}
              onChange={setPassword}
              showPassword={showPasswords}
              autoComplete="new-password"
            />
            <PasswordField
              id={confirmPasswordId}
              label="Confirm new password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              showPassword={showPasswords}
              autoComplete="new-password"
            />
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="flex items-center gap-2 text-xs text-slate-500">
                <i
                  className="fa-solid fa-circle-info text-brand-innovation"
                  aria-hidden="true"
                />
                Use at least 8 characters.
              </p>
              <button
                type="button"
                onClick={() => setShowPasswords((visible) => !visible)}
                aria-pressed={showPasswords}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-primary transition hover:text-brand-innovation"
              >
                <i
                  className={`fa-regular ${showPasswords ? "fa-eye-slash" : "fa-eye"}`}
                  aria-hidden="true"
                />
                {showPasswords ? "Hide passwords" : "Show passwords"}
              </button>
            </div>
            {error && (
              <div
                role="alert"
                className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-800"
              >
                <p>{error}</p>
                <Link
                  href="/login?forgot=1"
                  className="mt-2 inline-flex items-center gap-1.5 font-extrabold text-red-800 underline decoration-red-300 underline-offset-4"
                >
                  Request a new link
                  <i className="fa-solid fa-arrow-up-right-from-square text-[10px]" aria-hidden="true" />
                </Link>
              </div>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-primary px-5 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-brand-primary/15 transition duration-200 hover:-translate-y-0.5 hover:bg-[#1c3073] disabled:cursor-wait disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <i className="fa-solid fa-spinner animate-spin" aria-hidden="true" />
                  Updating password…
                </>
              ) : (
                <>
                  Reset password
                  <i className="fa-solid fa-arrow-right text-xs" aria-hidden="true" />
                </>
              )}
            </button>
          </form>
        )}

        <div className="mt-7 border-t border-slate-100 pt-5 text-center">
          <Link
            href="/login"
            className="text-xs font-bold text-slate-500 transition hover:text-brand-primary"
          >
            Back to log in
          </Link>
        </div>
      </div>
    </section>
  );
}

function PasswordField({
  id,
  label,
  value,
  onChange,
  showPassword,
  autoComplete,
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-bold text-brand-dark"
      >
        {label}
      </label>
      <div className="relative">
        <i
          className="fa-solid fa-lock pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          aria-hidden="true"
        />
        <input
          id={id}
          type={showPassword ? "text" : "password"}
          autoComplete={autoComplete}
          required
          minLength={8}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="At least 8 characters"
          className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3.5 pl-11 pr-12 text-sm text-brand-dark outline-none transition placeholder:text-gray-400 focus:border-brand-innovation focus:bg-white focus:ring-4 focus:ring-brand-innovation/10"
        />
        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400">
          <i
            className={`fa-solid ${showPassword ? "fa-lock-open" : "fa-lock"}`}
            aria-hidden="true"
          />
        </span>
      </div>
    </div>
  );
}
