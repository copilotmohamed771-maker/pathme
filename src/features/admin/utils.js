import { ADMIN_CATEGORIES } from "./constants";

export function isAdminCategory(value) {
  return ADMIN_CATEGORIES.some((category) => category === value);
}

export function filterAdminCourses(list, filters) {
  const q = filters.query.trim().toLowerCase();
  return list.filter((course) => {
    const matchesSearch =
      !q ||
      course.title.toLowerCase().includes(q) ||
      course.description.toLowerCase().includes(q) ||
      course.descriptionAr?.toLowerCase().includes(q);
    const matchesCategory =
      !filters.categories?.length ||
      filters.categories.includes(course.category);
    const matchesLevel =
      !filters.levels?.length || filters.levels.includes(course.level);
    const matchesStatus =
      filters.status === "all" ||
      (filters.status === "PUBLISH" ? course.isActive : !course.isActive);
    return matchesSearch && matchesCategory && matchesLevel && matchesStatus;
  });
}

export function leadStatusClasses(status) {
  switch (status) {
    case "New":
      return "bg-amber-100 text-amber-800";
    case "Contacted":
      return "bg-blue-100 text-blue-800";
    case "Enrolled":
      return "bg-emerald-100 text-emerald-800";
  }
}
