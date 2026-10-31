import Link from "next/link";
import { CoursePrice } from "@/components/ui/CoursePrice";
import { useLanguage } from "@/lib/language";
import { getCourseDescription } from "@/features/courses/api";

/* eslint-disable @next/next/no-img-element */

export function CourseCard({ course }) {
  const { language, t } = useLanguage();

  return (
    <article className="course-card-enter group flex flex-col justify-between overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl">
      <div>
        <div
          className={`relative isolate flex h-48 flex-col justify-between overflow-hidden bg-linear-to-r ${course.bgGradient} p-6 text-white`}
        >
          {course.courseImg && (
            <img
              src={course.courseImg}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 -z-10 h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
          )}
          {course.courseImg && (
            <div
              className="absolute inset-0 -z-10 bg-linear-to-t from-black/60 via-black/10 to-black/20"
              aria-hidden="true"
            />
          )}
          <div className="flex items-center justify-between gap-4">
            <span className="min-w-0 max-w-[55%] truncate rounded-full border border-white/30 bg-black/20 px-3 py-1 text-xs font-bold uppercase text-white backdrop-blur-md">
              {t(course.category)}
            </span>
            <span className="shrink-0 rounded-full bg-white px-3 py-1 text-xs font-extrabold text-brand-dark shadow-sm">
              <CoursePrice
                price={course.priceValue ?? course.price}
                discount={course.discount}
                discountedPrice={course.discountedPriceValue ?? course.discountedPrice}
                className="justify-end"
                originalClassName="text-[10px] font-semibold text-slate-400 line-through"
                discountClassName="text-[9px] font-bold text-rose-600"
              />
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 text-2xl backdrop-blur-md">
              <i className={course.icon} aria-hidden="true" />
            </div>
            <span className="rounded-md bg-black/30 px-2.5 py-1 text-xs font-semibold">
              {t(course.level)}
            </span>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <h3 className="text-xl font-bold text-brand-dark transition group-hover:text-emerald-800">
            {t(course.title)}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-2">
            {getCourseDescription(course, language)}
          </p>

          <div className="pt-2 border-t border-gray-100 space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-brand-innovation">
              {t("What you will learn:")}
            </p>
            <ul className="space-y-1.5 text-xs text-gray-600">
              {course.learnHighlights.map((item) => (
                <li key={item} className="flex items-start space-x-2">
                  <i
                    className="fa-solid fa-circle-check text-brand-innovation text-sm mt-0.5 shrink-0"
                    aria-hidden="true"
                  />
                  <span>{t(item)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="p-6 pt-0">
        <Link
          href={`/courses/${course.id}`}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-primary py-3 text-sm font-bold text-white shadow-md transition hover:bg-emerald-700 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
        >
          <span>{t("Explore course")}</span>
          <i className="fa-solid fa-arrow-right text-xs" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
