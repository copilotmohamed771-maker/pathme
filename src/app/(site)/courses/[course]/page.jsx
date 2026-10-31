import { Suspense } from "react";
import CourseDetailClient from "@/features/courses/components/CourseDetailClient";

export const metadata = { title: "Course Details | Courses" };

export default function CourseDetailPage({ params }) {
  return (
    <Suspense fallback={<CourseDetailFallback />}>
      <CourseDetailContent params={params} />
    </Suspense>
  );
}

async function CourseDetailContent({ params }) {
  const { course: courseId } = await params;
  return <CourseDetailClient courseId={courseId} />;
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
