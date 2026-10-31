"use client";

import { useId, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import {
  getResponseMessage,
  requestPasswordReset,
} from "@/features/auth/api";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ForgotPasswordModal({ open, onClose }) {
  const emailId = useId();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function closeModal() {
    if (isSubmitting) return;
    setEmail("");
    setError("");
    setSuccessMessage("");
    onClose();
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const identifier = email.trim();
    setError("");

    if (!identifier) {
      setError("Enter the email address associated with your account.");
      return;
    }
    if (!EMAIL_PATTERN.test(identifier)) {
      setError("Enter a valid email address.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await requestPasswordReset(identifier);
      setSuccessMessage(
        getResponseMessage(result) ||
          "If an account matches that email, a reset link has been sent.",
      );
    } catch (requestError) {
      setError(
        requestError.message ||
          "We couldn’t send a reset link right now. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={closeModal}
      title="Forgot your password?"
      maxWidth="max-w-lg"
      padding="p-0"
    >
      <div className="auth-modal-enter overflow-hidden rounded-3xl">
        <div className="relative overflow-hidden bg-gradient-to-br from-brand-primary via-[#263b7c] to-[#111b3a] px-6 py-7 text-white sm:px-8">
          <div
            className="pointer-events-none absolute -right-10 -top-20 h-48 w-48 rounded-full border border-white/10"
            aria-hidden="true"
          />
          <button
            type="button"
            onClick={closeModal}
            disabled={isSubmitting}
            aria-label="Close password reset dialog"
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-xl text-white/70 transition hover:bg-white/10 hover:text-white disabled:opacity-50"
          >
            <i className="fa-solid fa-xmark" aria-hidden="true" />
          </button>
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-xl text-brand-innovation">
            <i className="fa-solid fa-key" aria-hidden="true" />
          </span>
          <p className="mt-5 text-xs font-extrabold uppercase tracking-[0.18em] text-teal-200">
            Account recovery
          </p>
          <h2 className="mt-1 text-2xl font-extrabold tracking-tight">
            Forgot your password?
          </h2>
          <p className="mt-2 max-w-sm text-sm leading-6 text-blue-100">
            Enter the email connected to your account and we’ll send you a
            password reset link.
          </p>
        </div>

        {successMessage ? (
          <div className="space-y-5 p-6 sm:p-8">
            <div
              role="status"
              className="flex gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-900"
            >
              <i
                className="fa-solid fa-circle-check mt-1 text-emerald-600"
                aria-hidden="true"
              />
              <p>{successMessage}</p>
            </div>
            <button
              type="button"
              onClick={closeModal}
              className="w-full rounded-xl bg-brand-primary px-5 py-3.5 text-sm font-extrabold text-white transition hover:bg-[#1c3073] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
            >
              Back to log in
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 p-6 sm:p-8">
            <div>
              <label
                htmlFor={emailId}
                className="mb-2 block text-sm font-bold text-brand-dark"
              >
                Email address
              </label>
              <div className="relative">
                <i
                  className="fa-regular fa-envelope pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  aria-hidden="true"
                />
                <input
                  id={emailId}
                  type="email"
                  autoComplete="email"
                  autoCapitalize="none"
                  spellCheck={false}
                  required
                  autoFocus
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? `${emailId}-error` : undefined}
                  className={`w-full rounded-xl border bg-gray-50 py-3.5 pl-11 pr-4 text-sm text-brand-dark outline-none transition placeholder:text-gray-400 focus:bg-white focus:ring-4 ${
                    error
                      ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                      : "border-gray-200 focus:border-brand-innovation focus:ring-brand-innovation/10"
                  }`}
                />
              </div>
              {error && (
                <p
                  id={`${emailId}-error`}
                  role="alert"
                  className="mt-2 text-xs font-semibold text-red-600"
                >
                  {error}
                </p>
              )}
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-primary px-5 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-brand-primary/15 transition duration-200 hover:-translate-y-0.5 hover:bg-[#1c3073] disabled:cursor-wait disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <i className="fa-solid fa-spinner animate-spin" aria-hidden="true" />
                  Sending reset link…
                </>
              ) : (
                <>
                  Send reset link
                  <i className="fa-solid fa-arrow-right text-xs" aria-hidden="true" />
                </>
              )}
            </button>
            <p className="text-center text-xs leading-5 text-slate-500">
              We’ll send instructions to the email address you provide.
            </p>
          </form>
        )}
      </div>
    </Modal>
  );
}
