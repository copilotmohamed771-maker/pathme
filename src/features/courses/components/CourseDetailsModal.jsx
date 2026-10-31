"use client";

import { Modal } from "@/components/ui/Modal";
import { CoursePrice } from "@/components/ui/CoursePrice";
import { getCourseDescription } from "@/features/courses/api";
import { useLanguage } from "@/lib/language";
import { RoadmapView } from "./RoadmapView";
import { ProtectedWhatsAppButton } from "./ProtectedWhatsAppButton";

/** Popup shown when a student clicks "I'm Interested" on a course card. */
export function CourseDetailsModal({ course, onClose }) {
  const { language } = useLanguage();

  return (
    <Modal
      open={course !== null}
      onClose={onClose}
      title={course ? `${course.title} details` : "Course details"}
      maxWidth="max-w-2xl"
      padding="p-0"
    >
      {course && (
        <>
          <div
            className={`bg-gradient-to-r ${course.bgGradient} p-6 sm:p-8 text-white rounded-t-3xl relative`}
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition"
            >
              <i className="fa-solid fa-xmark" aria-hidden="true" />
            </button>

            <div className="flex items-center gap-2 flex-wrap mb-4">
              <span className="bg-white/20 text-xs font-bold px-3 py-1 rounded-full uppercase border border-white/20">
                {course.category}
              </span>
              <span className="text-xs font-semibold bg-black/20 px-2.5 py-1 rounded-md">
                {course.level}
              </span>
              <span className="text-xs font-semibold bg-black/20 px-2.5 py-1 rounded-md">
                <i className="fa-regular fa-clock mr-1" aria-hidden="true" />
                {course.duration}
              </span>
            </div>

            <div className="flex items-center gap-4 pr-8">
              <div className="w-14 h-14 shrink-0 rounded-2xl bg-white/20 flex items-center justify-center text-3xl">
                <i className={course.icon} aria-hidden="true" />
              </div>
              <p
                className="text-2xl sm:text-3xl font-extrabold leading-tight"
                aria-hidden="true"
              >
                {course.title}
              </p>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  Price
                </p>
                <CoursePrice
                  price={course.priceValue ?? course.price}
                  discount={course.discount}
                  discountedPrice={course.discountedPriceValue ?? course.discountedPrice}
                  className="text-3xl font-extrabold text-brand-primary"
                  originalClassName="text-base font-semibold text-slate-400 line-through"
                  discountClassName="text-sm font-bold text-rose-600"
                />
              </div>
              <p className="text-xs text-gray-500">
                {course.duration} · {course.level}
              </p>
            </div>

            <section>
              <h3 className="text-xs font-bold uppercase tracking-wider text-brand-innovation mb-2">
                About this course
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                {getCourseDescription(course, language)}
              </p>
            </section>

            <section>
              <h3 className="text-xs font-bold uppercase tracking-wider text-brand-innovation mb-2">
                What you will learn
              </h3>
              <ul className="space-y-1.5 text-sm text-gray-700">
                {course.learnHighlights.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <i
                      className="fa-solid fa-circle-check text-brand-innovation mt-1 shrink-0"
                      aria-hidden="true"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h3 className="text-xs font-bold uppercase tracking-wider text-brand-innovation mb-4">
                Course roadmap
              </h3>
              <RoadmapView course={course} />
            </section>

            <ProtectedWhatsAppButton
              course={course}
            />
          </div>
        </>
      )}
    </Modal>
  );
}
