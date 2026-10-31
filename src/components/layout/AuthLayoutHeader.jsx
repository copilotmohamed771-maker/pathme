"use client";

import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useLanguage } from "@/lib/language";

export function AuthLayoutHeader() {
  const { t } = useLanguage();

  return (
    <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3">
      <Logo size="sm" showTagline />
      <div className="flex items-center gap-2 sm:gap-4">
        <LanguageSwitcher />
        <Link
          href="/courses"
          className="hidden rounded-xl px-4 py-2 text-sm font-bold text-brand-primary transition hover:bg-white sm:inline-flex"
        >
          {t("Explore courses")} <span aria-hidden="true">→</span>
        </Link>
      </div>
    </div>
  );
}
