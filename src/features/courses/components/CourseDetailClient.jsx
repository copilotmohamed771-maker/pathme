"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  fetchCourseById,
  getCourseDescription,
} from "@/features/courses/api";
import { RoadmapView } from "./RoadmapView";
import { ProtectedWhatsAppButton } from "./ProtectedWhatsAppButton";
import { CoursePrice } from "@/components/ui/CoursePrice";
import { useLanguage } from "@/lib/language";
import { ExpandableDescription } from "./ExpandableDescription";

function formatCourseDuration(duration, language, t) {
  const match = String(duration).match(/^(\d+)\s*(days?|weeks?|months?)$/i);
  if (!match) return t(duration);

  const amount = Number(match[1]);
  const formattedAmount = new Intl.NumberFormat(
    language === "ar" ? "ar-EG" : "en-EG",
  ).format(amount);

  if (language !== "ar") return `${formattedAmount} ${match[2]}`;

  const unit = match[2].toLowerCase().replace(/s$/, "");
  const arabicUnit = {
    day: amount === 1 ? "يوم" : "أيام",
    week: amount === 1 ? "أسبوع" : "أسابيع",
    month: amount === 1 ? "شهر" : "أشهر",
  }[unit];

  return `${formattedAmount} ${arabicUnit}`;
}

export default function CourseDetailClient({ courseId }) {
  const { language, languageReady, t } = useLanguage();
  const [request, setRequest] = useState({
    courseId: null,
    status: "loading",
    course: null,
    error: "",
  });
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    if (!languageReady) return undefined;
    const controller = new AbortController();

    fetchCourseById(courseId, controller.signal)
      .then((course) =>
        setRequest({ courseId, status: "success", course, error: "" }),
      )
      .catch((requestError) => {
        if (!controller.signal.aborted) {
          setRequest({
            courseId,
            status: "error",
            course: null,
            error: requestError.message,
          });
        }
      });

    return () => controller.abort();
  }, [courseId, retryKey, language, languageReady]);

  if (request.courseId !== courseId || request.status === "loading") {
    return <CourseDetailFallback />;
  }

  if (request.status === "error") {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <h1 className="text-2xl font-extrabold text-brand-dark">
          Could not load this course
        </h1>
        <p className="mt-2 text-sm text-gray-600" role="alert">
          {request.error}
        </p>
        <button
          type="button"
          onClick={() => {
            setRequest({
              courseId,
              status: "loading",
              course: null,
              error: "",
            });
            setRetryKey((key) => key + 1);
          }}
          className="mt-5 rounded-xl bg-brand-primary px-6 py-3 text-sm font-bold text-white transition hover:bg-[#1c3073]"
        >
          Try again
        </button>
      </div>
    );
  }

  const { course } = request;
  if (!course) return null;

  return (
    <article className="course-detail-enter mx-auto max-w-6xl space-y-7 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <Link
        href="/courses"
        className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-brand-primary shadow-sm transition hover:border-emerald-200 hover:text-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
      >
        <i className="fa-solid fa-arrow-left" aria-hidden="true" />
        {t("Back to all courses")}
      </Link>

      <header
        className={`relative overflow-hidden rounded-3xl bg-linear-to-br ${course.bgGradient} p-6 text-white shadow-xl sm:p-10`}
      >
        <div
          className="absolute -right-20 -top-24 h-72 w-72 rounded-full border-36 border-white/10"
          aria-hidden="true"
        />
        <div className="relative grid gap-8 sm:grid-cols-[minmax(0,1fr)_14rem] sm:items-center lg:grid-cols-[minmax(0,1fr)_17rem]">
          <div className="max-w-3xl space-y-6">
            <div className="flex flex-wrap gap-2">
              {[course.category, course.level, course.duration].map((label) => (
                <span
                  key={label}
                  className="rounded-full border border-white/30 bg-black/10 px-3 py-1.5 text-xs font-bold backdrop-blur-sm"
                >
                  {label}
                </span>
              ))}
            </div>
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/15 text-2xl shadow-inner sm:h-16 sm:w-16 sm:text-3xl">
                <i className={course.icon} aria-hidden="true" />
              </div>
              <div>
                <p className="mb-1 text-xs font-bold uppercase tracking-widest text-white/75">
                  {t("Your next learning adventure")}
                </p>
                <h1 className="text-3xl font-extrabold leading-tight sm:text-4xl lg:text-5xl">
                  {course.title}
                </h1>
              </div>
            </div>
          </div>
          {course.courseImage && (
            <img
              src={course.courseImage}
              alt={course.title}
              className="aspect-4/3 w-full rounded-2xl border border-white/30 object-cover shadow-lg sm:aspect-square"
            />
          )}
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-6">
          <section className="course-detail-section rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_14px_45px_-32px_rgba(16,24,47,0.35)] sm:p-8">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                <i className="fa-regular fa-compass" aria-hidden="true" />
              </span>
              <h2 className="text-xl font-extrabold text-brand-dark">
                {t("A little about this course")}
              </h2>
            </div>
            <ExpandableDescription
              text={getCourseDescription(course, language)}
              className="mt-4 leading-relaxed text-slate-600"
            />
          </section>

          <section className="course-detail-section rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_14px_45px_-32px_rgba(16,24,47,0.35)] sm:p-8">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                <i className="fa-solid fa-lightbulb" aria-hidden="true" />
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-emerald-700">
                  {t("Skills you’ll take with you")}
                </p>
                <h2 className="text-xl font-extrabold text-brand-dark">
                  {t("What you will learn")}
                </h2>
              </div>
            </div>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {course.learnHighlights.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4 text-sm leading-relaxed text-slate-700"
                >
                  <i
                    className="fa-solid fa-circle-check mt-0.5 shrink-0 text-emerald-700"
                    aria-hidden="true"
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="course-detail-section rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_14px_45px_-32px_rgba(16,24,47,0.35)] sm:p-8">
            <div className="mb-6 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-700">
                <i className="fa-solid fa-route" aria-hidden="true" />
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-emerald-700">
                  {t("One step at a time")}
                </p>
                <h2 className="text-xl font-extrabold text-brand-dark">
                  {t("Your course roadmap")}
                </h2>
              </div>
            </div>
            <RoadmapView course={course} />
          </section>
        </div>

        <aside className="h-fit rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_14px_45px_-32px_rgba(16,24,47,0.35)] lg:sticky lg:top-8">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
            {t("Your course investment")}
          </p>
          <CoursePrice
            price={course.priceValue ?? course.price}
            discount={course.discount}
            discountedPrice={course.discountedPriceValue ?? course.discountedPrice}
            className="mt-2 text-4xl font-extrabold text-brand-primary"
            originalClassName="text-xl font-semibold text-slate-400 line-through"
            discountClassName="text-base font-bold text-rose-600"
          />
          <div className="my-5 space-y-3 border-y border-slate-100 py-5 text-sm text-slate-600">
            <p className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-2">
                <i
                  className="fa-regular fa-clock text-emerald-700"
                  aria-hidden="true"
                />
                {t("Duration")}
              </span>
              <strong className="text-brand-dark">
                {formatCourseDuration(course.duration, language, t)}
              </strong>
            </p>
            <p className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-2">
                <i
                  className="fa-solid fa-layer-group text-emerald-700"
                  aria-hidden="true"
                />
                {t("Level")}
              </span>
              <strong className="text-brand-dark">{t(course.level)}</strong>
            </p>
          </div>
          <p className="mb-4 text-sm leading-relaxed text-slate-600">
            {t("Ready to turn your curiosity into a new skill?")}
          </p>
          <ProtectedWhatsAppButton
            course={course}
          />
          <p className="mt-3 text-center text-xs leading-relaxed text-slate-500">
            {t("We’ll help you get started over WhatsApp.")}
          </p>
        </aside>
      </div>
    </article>
  );
}

function CourseDetailFallback() {
  return (
    <div
      className="mx-auto max-w-6xl animate-pulse px-4 py-12 sm:px-6 lg:px-8"
      aria-label="Loading course details"
      role="status"
    >
      <div className="h-5 w-40 rounded bg-gray-200" />
      <div className="mt-8 h-56 rounded-3xl bg-gray-200" />
      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-6">
          <div className="h-40 rounded-3xl bg-gray-200" />
          <div className="h-56 rounded-3xl bg-gray-200" />
        </div>
        <div className="h-72 rounded-3xl bg-gray-200" />
      </div>
    </div>
  );
}
