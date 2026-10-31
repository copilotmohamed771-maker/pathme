import { COURSE_CATEGORIES } from "./constants";

export function isCourseCategory(value) {
  return COURSE_CATEGORIES.some((category) => category === value);
}

export function filterCourses(list, category, query) {
  const q = query.trim().toLowerCase();
  return list.filter((course) => {
    const matchesCategory = category === "All" || course.category === category;
    const matchesQuery =
      !q || course.title.toLowerCase().includes(q) || course.description.toLowerCase().includes(q);
    return matchesCategory && matchesQuery;
  });
}
