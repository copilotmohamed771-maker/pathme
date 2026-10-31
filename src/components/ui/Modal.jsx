"use client";

import { useEffect, useId } from "react";

export function Modal({
  open,
  onClose,
  title,
  children,
  variant = "site",
  maxWidth = "max-w-lg",
  padding = "p-6 sm:p-8",
}) {
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const isSite = variant === "site";

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${
        isSite ? "bg-brand-dark/60 backdrop-blur-sm" : "bg-brand-dark/40 backdrop-blur-xs"
      }`}
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={
          isSite
            ? `relative w-full ${maxWidth} max-h-[90vh] overflow-y-auto bg-white rounded-3xl ${padding} shadow-2xl border border-gray-100`
            : `relative w-full ${maxWidth} max-h-[90vh] overflow-y-auto bg-white rounded-2xl ${padding} shadow-xl border border-gray-100`
        }
      >
        <h2 id={titleId} className="sr-only">
          {title}
        </h2>
        {children}
      </div>
    </div>
  );
}
