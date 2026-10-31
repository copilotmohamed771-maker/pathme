"use client";

import Link from "next/link";
import { useEffect, useId, useState } from "react";
import { fetchCourseCategories } from "@/features/courses/api";
import { useLanguage } from "@/lib/language";

export function FooterCategories() {
  const { language, languageReady, t } = useLanguage();
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState(false);
  const listId = useId();
  const visibleCategories = expanded ? categories : categories.slice(0, 4);
  const hasMoreCategories = categories.length > 4;

  useEffect(() => {
    if (!languageReady) return undefined;
    const controller = new AbortController();

    fetchCourseCategories(controller.signal)
      .then(setCategories)
      .catch((requestError) => {
        if (!controller.signal.aborted) {
          setError(requestError.message || "Could not load categories.");
        }
      });

    return () => controller.abort();
  }, [language, languageReady]);

  return (
    <div>
      <h2 className="text-xs font-extrabold uppercase tracking-[0.18em] text-brand-innovation">
        {t("Explore subjects")}
      </h2>
      <ul className="mt-4 space-y-2.5" id={listId}>
        {visibleCategories.map((category) => (
          <li key={category}>
            <Link
              href={`/courses?category=${encodeURIComponent(category)}`}
              className="group inline-flex items-center gap-2 text-sm text-slate-300 transition duration-200 hover:translate-x-0.5 hover:text-white"
            >
              <i
                className="fa-solid fa-arrow-right text-[10px] text-brand-innovation opacity-0 transition group-hover:opacity-100"
                aria-hidden="true"
              />
              <span>{category}</span>
            </Link>
          </li>
        ))}
      </ul>

      {!categories.length && !error && (
        <p className="mt-4 text-sm text-slate-400" role="status">
          {t("Loading categories…")}
        </p>
      )}
      {error && (
        <p className="mt-4 max-w-xs text-xs leading-5 text-amber-200" role="status">
          Categories could not be loaded: {error}
        </p>
      )}
      {hasMoreCategories && (
        <button
          type="button"
          aria-expanded={expanded}
          aria-controls={listId}
          onClick={() => setExpanded((isExpanded) => !isExpanded)}
          className="mt-4 inline-flex items-center gap-2 text-xs font-extrabold text-brand-innovation transition hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-innovation"
        >
          {t(expanded ? "Show fewer categories" : "Explore more categories")}
          <i
            className={`fa-solid fa-chevron-down text-[10px] transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
            aria-hidden="true"
          />
        </button>
      )}
    </div>
  );
}
