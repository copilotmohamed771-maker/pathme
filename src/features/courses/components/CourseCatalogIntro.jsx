"use client";

import { useLanguage } from "@/lib/language";

export function CourseCatalogIntro() {
  const { t } = useLanguage();

  return (
    <div className="course-intro-enter relative overflow-hidden rounded-3xl border border-emerald-100 bg-[#e9f7f2] px-6 py-9 sm:px-10 sm:py-12">
      <div className="relative mx-auto max-w-3xl text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-3 py-1 text-xs font-bold uppercase tracking-widest text-emerald-800">
          <i className="fa-solid fa-sparkles" aria-hidden="true" />
          {t("Explore Pathways")}
        </span>
        <h1 className="mt-4 text-3xl font-extrabold leading-tight text-brand-dark sm:text-4xl">
          {t("Find your next favorite thing to learn.")}
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
          {t("Build real skills, make something you’re proud of, and discover where your curiosity can take you.")}
        </p>
      </div>
    </div>
  );
}
