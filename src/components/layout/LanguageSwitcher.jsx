"use client";

import { useHydrated, useLanguage } from "@/lib/language";

export function LanguageSwitcher({ className = "" }) {
  const { language, setLanguage, t } = useLanguage();
  const isHydrated = useHydrated();
  const displayLanguage = isHydrated ? language : "en";
  const label = isHydrated ? t("Select language") : "Select language";

  return (
    <label
      className={`inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200/80 bg-white px-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-brand-primary/25 hover:shadow-md focus-within:border-brand-primary/40 focus-within:ring-4 focus-within:ring-brand-primary/10 ${className}`}
    >
      <i
        className="fa-solid fa-globe text-brand-primary"
        aria-hidden="true"
      />
      <span className="sr-only">{label}</span>
      <select
        value={displayLanguage}
        onChange={(event) => setLanguage(event.target.value)}
        aria-label={label}
        suppressHydrationWarning
        className="h-full cursor-pointer appearance-none bg-transparent outline-none"
      >
        <option value="en">English</option>
        <option value="ar">العربية</option>
      </select>
      <i
        className="fa-solid fa-chevron-down text-[10px] text-slate-400"
        aria-hidden="true"
      />
    </label>
  );
}
