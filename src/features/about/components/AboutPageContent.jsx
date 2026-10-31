"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { apiRequest } from "@/lib/api";
import { useLanguage } from "@/lib/language";

const INITIAL_COUNTS = {
  courseCount: 0,
  studentsEnrolled: 0,
  learningCategoriesCount: 0,
};

const STATS = [
  {
    key: "courseCount",
    label: "Practical courses",
    detail: "Built to turn curiosity into real skills",
    icon: "fa-book-open",
    tint: "bg-blue-50 text-brand-primary",
  },
  {
    key: "studentsEnrolled",
    label: "Students enrolled",
    detail: "Learning and building with PathMe",
    icon: "fa-user-graduate",
    tint: "bg-orange-50 text-brand-energy",
  },
  {
    key: "learningCategoriesCount",
    label: "Learning categories",
    detail: "Explore ideas across technology and more",
    icon: "fa-layer-group",
    tint: "bg-teal-50 text-brand-innovation",
  },
];

const VALUES = [
  {
    number: "01",
    icon: "fa-lightbulb",
    title: "Learn by doing",
    text: "Turn new concepts into hands-on projects and practical skills you can use beyond the classroom.",
    tint: "bg-blue-50 text-brand-primary",
  },
  {
    number: "02",
    icon: "fa-compass",
    title: "Find your path",
    text: "Explore a broad range of subjects and discover the topics that inspire you to keep learning.",
    tint: "bg-teal-50 text-brand-innovation",
  },
  {
    number: "03",
    icon: "fa-people-group",
    title: "Grow together",
    text: "Build confidence through an encouraging learning experience designed around student growth.",
    tint: "bg-orange-50 text-brand-energy",
  },
  {
    number: "04",
    icon: "fa-rocket",
    title: "Get ready for what’s next",
    text: "Develop creative thinking and future-ready skills one lesson, experiment, and project at a time.",
    tint: "bg-purple-50 text-purple-600",
  },
];

function readAboutStats(result) {
  const data =
    result?.data?.data ??
    result?.data ??
    result?.result?.data ??
    result?.result ??
    result;
  const stats = {};

  for (const key of Object.keys(INITIAL_COUNTS)) {
    const value = data?.[key];
    if (
      (typeof value !== "number" && typeof value !== "string") ||
      value === "" ||
      !Number.isFinite(Number(value)) ||
      Number(value) < 0
    ) {
      throw new Error("The About stats response was missing valid statistics.");
    }
    stats[key] = Math.floor(Number(value));
  }

  return stats;
}

export default function AboutPageContent() {
  const { language, t } = useLanguage();
  const isArabic = language === "ar";
  const statsRef = useRef(null);
  const [stats, setStats] = useState(null);
  const [counts, setCounts] = useState(INITIAL_COUNTS);
  const [statsInView, setStatsInView] = useState(false);
  const [statsError, setStatsError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    apiRequest("/api/about-us/stats", { signal: controller.signal })
      .then((result) => {
        setStats(readAboutStats(result));
      })
      .catch((error) => {
        if (!controller.signal.aborted) {
          setStatsError(error.message || "Could not load About statistics.");
        }
      });

    return () => controller.abort();
  }, []);

  useEffect(() => {
    const section = statsRef.current;
    if (!section) return undefined;

    if (!("IntersectionObserver" in window)) {
      const frameId = requestAnimationFrame(() => setStatsInView(true));
      return () => cancelAnimationFrame(frameId);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStatsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    observer.observe(section);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!stats || !statsInView) return undefined;

    let frameId;
    let startTime;
    const duration = window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? 0
      : 1400;

    function updateCounts(timestamp) {
      if (startTime === undefined) startTime = timestamp;
      const progress =
        duration === 0 ? 1 : Math.min((timestamp - startTime) / duration, 1);
      const easedProgress = 1 - (1 - progress) ** 4;

      setCounts({
        courseCount: Math.round(stats.courseCount * easedProgress),
        studentsEnrolled: Math.round(stats.studentsEnrolled * easedProgress),
        learningCategoriesCount: Math.round(
          stats.learningCategoriesCount * easedProgress,
        ),
      });

      if (progress < 1) frameId = requestAnimationFrame(updateCounts);
    }

    frameId = requestAnimationFrame(updateCounts);
    return () => cancelAnimationFrame(frameId);
  }, [stats, statsInView]);

  return (
    <div className="mx-auto max-w-7xl space-y-16 px-4 py-8 sm:px-6 sm:py-12 lg:space-y-24 lg:px-8">
      <section className="about-enter relative isolate overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand-primary via-[#263d83] to-slate-950 px-6 py-14 text-white shadow-2xl sm:px-12 sm:py-20 lg:px-16">
        <div
          className={`pointer-events-none absolute ${isArabic ? "-left-20" : "-right-20"} -top-28 -z-10 h-80 w-80 rounded-full border border-white/10 sm:h-[30rem] sm:w-[30rem]`}
          aria-hidden="true"
        />
        <div
          className={`pointer-events-none absolute -bottom-32 ${isArabic ? "left-16" : "right-16"} -z-10 h-72 w-72 rounded-full bg-brand-innovation/20 blur-3xl`}
          aria-hidden="true"
        />
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-teal-200 backdrop-blur">
            <i className="fa-solid fa-sparkles" aria-hidden="true" />
            {t("About PathMe")}
          </span>
          <h1 className="mt-6 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            {t("Learning that helps you")}{" "}
            <span className="text-brand-energy">{t("find your next step.")}</span>
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-blue-100 sm:text-lg">
            {t("PathMe helps students explore technology, build practical skills, and turn their curiosity into projects they can be proud of.")}
          </p>
          <Link
            href="/courses"
            className="mt-8 inline-flex items-center gap-3 rounded-xl bg-brand-energy px-6 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-orange-950/20 transition duration-300 hover:-translate-y-0.5 hover:bg-amber-500 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
          >
            {t("Explore our courses")}
            <i className="fa-solid fa-arrow-right" aria-hidden="true" />
          </Link>
        </div>
        <div
          className={`absolute bottom-8 ${isArabic ? "left-10" : "right-10"} hidden h-32 w-32 items-center justify-center rounded-[2rem] border border-white/15 bg-white/5 text-5xl text-white/80 backdrop-blur-sm lg:flex`}
          aria-hidden="true"
        >
          <i className="fa-solid fa-shapes" />
        </div>
      </section>

      <section ref={statsRef} aria-labelledby="about-stats-heading">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-brand-innovation">
              {t("PathMe in numbers")}
            </p>
            <h2
              id="about-stats-heading"
              className="mt-2 text-2xl font-extrabold text-brand-dark sm:text-3xl"
            >
              {t("A growing community of learners")}
            </h2>
          </div>
          {statsError ? (
            <p role="status" className="max-w-sm text-sm text-rose-700">
              {t("Statistics could not be loaded.")} {statsError}
            </p>
          ) : (
            !stats && (
              <p role="status" className="text-sm text-slate-500">
                {t("Loading the latest PathMe stats…")}
              </p>
            )
          )}
        </div>

        <dl className="grid gap-4 sm:grid-cols-3 sm:gap-6">
          {STATS.map(({ key, label, detail, icon, tint }) => (
            <div
              key={key}
              className="about-stat-card group rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-brand-primary/20 hover:shadow-xl hover:shadow-brand-primary/5 sm:p-7"
            >
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-2xl text-lg transition duration-300 group-hover:scale-110 ${tint}`}
                aria-hidden="true"
              >
                <i className={`fa-solid ${icon}`} />
              </div>
              <dd
                className="mt-6 text-4xl font-extrabold tracking-tight text-brand-primary tabular-nums sm:text-5xl"
                aria-label={stats ? `${stats[key]} ${t(label)}` : `0 ${t(label)}`}
              >
                {counts[key].toLocaleString()}
              </dd>
              <dt className="mt-2 text-sm font-extrabold text-brand-dark">
                {t(label)}
              </dt>
              <p className="mt-1 text-xs leading-5 text-slate-500">              {t(detail)}</p>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="about-values-heading">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-brand-energy">
            {t("What guides us")}
          </p>
          <h2
            id="about-values-heading"
            className="mt-2 text-3xl font-extrabold tracking-tight text-brand-dark sm:text-4xl"
          >
            {t("Learning with purpose")}
          </h2>
          <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
            {t("Every part of the PathMe experience is designed to help students take an idea and make something meaningful with it.")}
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          {VALUES.map(({ number, icon, title, text, tint }) => (
            <article
              key={number}
              className="about-value-card group flex gap-5 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg sm:p-8"
            >
              <div
                className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-xl transition duration-300 group-hover:rotate-3 group-hover:scale-105 ${tint}`}
                aria-hidden="true"
              >
                <i className={`fa-solid ${icon}`} />
              </div>
              <div>
                <p className="text-xs font-extrabold tracking-widest text-slate-400">
                  {number}
                </p>
                <h3 className="mt-1 text-lg font-extrabold text-brand-dark">
                  {t(title)}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{t(text)}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-brand-primary/10 bg-gradient-to-r from-blue-50 via-white to-teal-50 px-6 py-10 text-center sm:px-10">
        <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-brand-primary">
          {t("Your next step starts here")}
        </p>
        <h2 className="mx-auto mt-3 max-w-2xl text-2xl font-extrabold text-brand-dark sm:text-3xl">
          {t("Ready to discover what you can create?")}
        </h2>
        <Link
          href="/courses"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-primary px-6 py-3 text-sm font-bold text-white transition duration-300 hover:-translate-y-0.5 hover:bg-blue-950 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-primary"
        >
          {t("Find your course")}
          <i className="fa-solid fa-arrow-right" aria-hidden="true" />
        </Link>
      </section>
    </div>
  );
}