/* eslint-disable @next/next/no-img-element */

import { useLanguage } from "@/lib/language";

/**
 * Course roadmap. Shows the course's roadmap picture when one is provided,
 * otherwise draws the steps as a visual timeline.
 */
export function RoadmapView({ course }) {
  const { t } = useLanguage();

  if (course.roadmapImage) {
    return (
      <img
        src={course.roadmapImage}
        alt={`${course.title} roadmap`}
        className="w-full rounded-2xl border border-gray-100"
      />
    );
  }

  return (
    <div className="space-y-5">
      <p className="flex items-center gap-2 rounded-xl border border-sky-100 bg-sky-50 px-4 py-3 text-sm font-medium text-sky-800">
        <i className="fa-solid fa-route shrink-0" aria-hidden="true" />
        {t("We’re working on this course roadmap. The visual roadmap will be available soon.")}
      </p>
      {course.roadmap.length > 0 && (
        <ol className="relative ml-3 space-y-5 border-l-2 border-dashed border-brand-innovation/40">
          {course.roadmap.map((step, index) => (
            <li key={step.title} className="relative pl-8">
              <span
                className={`absolute -left-[17px] top-0 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r ${course.bgGradient} text-xs font-extrabold text-white shadow-md`}
              >
                {index + 1}
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="text-sm font-bold text-brand-dark">
                  {step.title}
                </h4>
                <span className="rounded-full bg-brand-innovation/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand-innovation">
                  {step.period}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-gray-600">{step.detail}</p>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
