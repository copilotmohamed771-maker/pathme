"use client";

import { useEffect, useState } from "react";
import { fetchTopEnrolledCourses } from "@/features/courses/api";
import { CourseGrid } from "@/features/courses/components/CourseGrid";
import { useLanguage } from "@/lib/language";

export function FeaturedCourses() {
  const { language, languageReady, t } = useLanguage();
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!languageReady) return undefined;
    const controller = new AbortController();
    fetchTopEnrolledCourses(controller.signal)
      .then((topCourses) => setCourses(topCourses.slice(0, 3)))
      .catch((requestError) => {
        if (!controller.signal.aborted) setError(requestError.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [language, languageReady]);

  if (isLoading) {
    return (
      <div
        className="rounded-3xl border border-gray-100 bg-white py-12 text-center text-sm font-semibold text-gray-500"
        role="status"
      >
        <i
          className="fa-solid fa-spinner mr-2 animate-spin"
          aria-hidden="true"
        />
        {t("Loading popular courses...")}
      </div>
    );
  }

  if (error) {
    return (
      <p
        className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900"
        role="alert"
      >
        {t("Popular courses are temporarily unavailable. Please visit the course catalog to try again.")}
      </p>
    );
  }

  if (courses.length === 0) {
    return (
      <p className="rounded-2xl border border-gray-200 bg-white p-5 text-center text-sm text-gray-500">
        {t("No courses are available yet. Please check back soon.")}
      </p>
    );
  }

  return <CourseGrid courses={courses} />;
}
