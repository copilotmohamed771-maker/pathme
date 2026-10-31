import { CourseCard } from "./CourseCard";

/** Renders course cards that link to their full course detail pages. */
export function CourseGrid({ courses }) {
  return (
    <div className="course-grid grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {courses.map((course) => (
        <CourseCard key={course.id} course={course} />
      ))}
    </div>
  );
}
