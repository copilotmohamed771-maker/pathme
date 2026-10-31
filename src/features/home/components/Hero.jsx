"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchCourseCategories } from "@/features/courses/api";
import { useLanguage } from "@/lib/language";

export function Hero() {
  const { language, languageReady, t } = useLanguage();
  const [categories, setCategories] = useState([]);
  const [categoriesError, setCategoriesError] = useState("");

  useEffect(() => {
    if (!languageReady) return undefined;
    const controller = new AbortController();

    fetchCourseCategories(controller.signal)
      .then((result) => {
        setCategories(result.slice(0, 4));
        setCategoriesError("");
      })
      .catch((error) => {
        if (!controller.signal.aborted) {
          setCategoriesError(
            error.message || "Could not load popular categories.",
          );
        }
      });

    return () => controller.abort();
  }, [language, languageReady]);

  return (
    <div className="home-hero-enter bg-linear-to-br from-brand-primary via-brand-primary to-slate-900 rounded-3xl p-8 sm:p-12 lg:p-16 text-white relative overflow-hidden shadow-2xl">
      <div
        className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none"
        aria-hidden="true"
      >
        <svg width="400" height="400" viewBox="0 0 200 200">
          <path
            d="M20,100 C50,20 150,20 180,100 C150,180 50,180 20,100 Z"
            fill="none"
            stroke="white"
            strokeWidth="4"
          />
          <circle cx="20" cy="100" r="10" fill="#16B8A6" />
          <circle cx="180" cy="100" r="10" fill="#FF9F43" />
        </svg>
      </div>

      <div className="max-w-3xl relative z-10 space-y-6">
        <div className="home-hero-item home-hero-delay-1 inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20 text-xs font-semibold tracking-wider text-brand-innovation">
          <i className="fa-solid fa-wand-magic-sparkles" aria-hidden="true" />
          <span>{t("AI & PROGRAMMING EDUCATION FOR WHAT'S NEXT")}</span>
        </div>

        <h1 className="home-hero-item home-hero-delay-2 text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight">
          {t("Build real skills.")}
          <br />
          {t("Create real projects.")}
          <br />
          <span className="text-brand-energy">{t("Shape your future.")}</span>
        </h1>

        <p className="home-hero-item home-hero-delay-3 text-lg sm:text-xl text-gray-200 font-normal leading-relaxed max-w-2xl">
          {t("Practical, interactive learning pathways designed specifically for school students to master technology, coding, science, and future-ready skills.")}
        </p>

        <div className="home-hero-item home-hero-delay-4 pt-4 space-y-4">
          <form
            action="/courses"
            role="search"
            className="flex max-w-2xl flex-col gap-2 rounded-2xl bg-white p-2 shadow-xl sm:flex-row"
          >
            <div className="flex-1 flex items-center px-3 text-gray-400">
              <i
                className="fa-solid fa-magnifying-glass text-lg mr-3"
                aria-hidden="true"
              />
              <label htmlFor="hero-search-input" className="sr-only">
                {t("Search courses")}
              </label>
              <input
                id="hero-search-input"
                type="search"
                name="search"
                required
                placeholder={t("Search Python, AI, Math, Web Dev...")}
                className="w-full text-brand-dark focus:outline-none py-2 text-sm sm:text-base"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-brand-innovation hover:bg-teal-600 text-white font-bold rounded-xl transition shadow-md"
            >
              {t("Search Courses")}
            </button>
          </form>

          <div className="flex flex-wrap items-center gap-2 pt-2 text-xs font-medium sm:text-sm">
            <span className="mr-1 text-gray-300">{t("Popular categories:")}</span>
            {categories.map((category) => (
              <Link
                key={category}
                href={`/courses?category=${encodeURIComponent(category)}`}
                className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-white transition hover:-translate-y-0.5 hover:bg-white/20"
              >
                {category}
              </Link>
            ))}
            {categoriesError && (
              <span className="text-xs text-amber-200" role="status">
                Popular categories could not be loaded: {categoriesError}
              </span>
            )}
          </div>
        </div>

        <div className="home-hero-item home-hero-delay-5 flex flex-wrap gap-4 pt-4">
          <Link
            href="/courses"
            className="px-8 py-4 rounded-xl bg-brand-energy hover:bg-amber-500 text-white font-bold text-base shadow-lg shadow-brand-energy/30 transition transform hover:-translate-y-0.5"
          >
            {t("Browse All Courses")}
          </Link>
          <Link
            href="/about"
            className="px-8 py-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-base border border-white/20 backdrop-blur-sm transition"
          >
            {t("Learn More About Us")}
          </Link>
        </div>
      </div>
    </div>
  );
}
