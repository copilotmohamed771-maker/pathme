import { apiRequest } from "@/lib/api";

const COURSE_PRESENTATION = [
  {
    match: /artificial intelligence|\bai\b|machine learning/i,
    icon: "fa-solid fa-brain",
    gradient: "from-teal-500 to-emerald-600",
  },
  {
    match: /backend|server/i,
    icon: "fa-solid fa-server",
    gradient: "from-blue-500 to-indigo-600",
  },
  {
    match: /frontend|web|react/i,
    icon: "fa-solid fa-code",
    gradient: "from-purple-500 to-pink-600",
  },
  {
    match: /math/i,
    icon: "fa-solid fa-square-root-variable",
    gradient: "from-amber-500 to-orange-600",
  },
  {
    match: /robot|hardware|science/i,
    icon: "fa-solid fa-robot",
    gradient: "from-cyan-500 to-blue-600",
  },
  {
    match: /python/i,
    icon: "fa-brands fa-python",
    gradient: "from-blue-500 to-indigo-600",
  },
];

export const ALL_GRADES_LEVEL = "ALLGRADES";

function toLearnHighlights(value) {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  if (typeof value === "string") {
    return value
      .split(/[\n,;]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

function normalizeCourse(course) {
  const title = course.name || course.title || "Untitled course";
  const category = course.categoryName || course.category || "Uncategorized";
  const presentation = COURSE_PRESENTATION.find(({ match }) =>
    match.test(`${category} ${title}`),
  );
  const numericPrice = Number(course.price);
  const numericDiscountedPrice =
    course.discountedPrice == null || course.discountedPrice === ""
      ? Number.NaN
      : Number(course.discountedPrice);
  const discount = Number(
    course.discount ?? course.discountPercentage ?? course.discountPercent ?? 0,
  );

  return {
    ...course,
    id: String(course.id),
    title,
    category,
    price:
      course.price == null || course.price === ""
        ? "Contact for price"
        : Number.isFinite(numericPrice) && numericPrice === 0
          ? "Free Trial"
          : Number.isFinite(numericPrice)
            ? new Intl.NumberFormat("en-US", {
                maximumFractionDigits: 2,
              }).format(numericPrice)
            : String(course.price),
    priceValue:
      Number.isFinite(numericPrice) && numericPrice > 0 ? numericPrice : null,
    discountedPriceValue:
      Number.isFinite(numericDiscountedPrice) ? numericDiscountedPrice : null,
    discount: Number.isFinite(discount) ? discount : 0,
    level: course.level || "All levels",
    duration: course.duration || "Duration varies",
    description: course.description || "Course details will be available soon.",
    learnHighlights: toLearnHighlights(
      course.whatYouWillLearn ?? course.learnHighlights,
    ),
    courseImage: course.courseImg || course.courseImage || null,
    roadmapImage: course.roadmapImg || course.roadmapImage || null,
    roadmap: Array.isArray(course.roadmap) ? course.roadmap : [],
    icon: course.icon || presentation?.icon || "fa-solid fa-book-open",
    bgGradient:
      course.bgGradient ||
      presentation?.gradient ||
      "from-slate-500 to-slate-700",
  };
}

export function getCourseDescription(course, language) {
  if (language === "ar" && course.descriptionAr?.trim()) {
    return course.descriptionAr;
  }
  return course.description;
}

function buildCourseParams({
  page = 1,
  search = "",
  categories = [],
  levels = [],
  minPrice,
  maxPrice,
} = {}) {
  const params = new URLSearchParams({ page: String(page) });
  if (search.trim()) params.set("search", search.trim());
  categories.forEach((category) => params.append("categories", category));
  levels.forEach((level) => params.append("levels", level));
  if (minPrice !== "" && minPrice != null) params.set("minPrice", minPrice);
  if (maxPrice !== "" && maxPrice != null) params.set("maxPrice", maxPrice);
  return params;
}

async function requestCoursePage(path, params, page, signal) {
  const result = await apiRequest(`${path}?${params}`, { signal });

  if (!result || !Array.isArray(result.content)) {
    throw new Error("The courses API returned an unexpected response.");
  }

  return {
    courses: result.content.map(normalizeCourse),
    page,
    totalPages: Number.isInteger(result.totalPages) ? result.totalPages : 1,
    totalElements: Number.isInteger(result.totalElements)
      ? result.totalElements
      : result.content.length,
    first: typeof result.first === "boolean" ? result.first : page <= 1,
    last:
      typeof result.last === "boolean"
        ? result.last
        : page >= (Number.isInteger(result.totalPages) ? result.totalPages : 1),
  };
}

/** Fetch an unfiltered one-based course page. */
export async function fetchCoursePage({ page = 1, signal } = {}) {
  return requestCoursePage(
    "/courses",
    buildCourseParams({ page }),
    page,
    signal,
  );
}

/** Fetch courses ranked by enrollment for the home page. */
export async function fetchTopEnrolledCourses(signal) {
  const result = await apiRequest("/courses/top-enrolled", { signal });
  const candidates = [
    result,
    result?.data,
    result?.result,
    result?.data?.data,
    result?.result?.data,
  ].filter((candidate) => candidate && typeof candidate === "object");
  const courses = candidates
    .map((candidate) =>
      Array.isArray(candidate)
        ? candidate
        : candidate.content || candidate.courses || candidate.topEnrolled,
    )
    .find(Array.isArray);

  if (!courses) {
    throw new Error("The top-enrolled courses API returned an unexpected response.");
  }

  return courses.map(normalizeCourse);
}

/** Fetch and normalize a single course by ID. */
export async function fetchCourseById(courseId, signal) {
  const result = await apiRequest(`/courses/${encodeURIComponent(courseId)}`, {
    signal,
  });

  if (!result || typeof result !== "object" || Array.isArray(result)) {
    throw new Error("The course API returned an unexpected response.");
  }

  return normalizeCourse(result.course || result);
}

/** Apply search, category, level, and price filters via the filter endpoint. */
export async function fetchFilteredCoursePage(options = {}) {
  const page = options.page ?? 1;
  return requestCoursePage(
    "/courses/filter",
    buildCourseParams(options),
    page,
    options.signal,
  );
}

function readCategoryNames(result) {
  const rows = Array.isArray(result)
    ? result
    : Array.isArray(result?.content)
      ? result.content
      : Array.isArray(result?.categories)
        ? result.categories
        : null;

  if (!rows) {
    throw new Error("The categories API returned an unexpected response.");
  }

  return [
    ...new Set(
      rows
        .map((category) =>
          typeof category === "string"
            ? category
            : category?.name || category?.categoryName,
        )
        .filter((name) => typeof name === "string" && name.trim())
        .map((name) => name.trim()),
    ),
  ].sort((a, b) => a.localeCompare(b));
}

export async function fetchCourseCategories(signal) {
  const result = await apiRequest("/categories", { signal });
  return readCategoryNames(result);
}

/** Load category names from /categories and levels from all course pages. */
export async function fetchCourseFilterOptions(signal) {
  const [categoryResult, firstPage] = await Promise.all([
    apiRequest("/categories", { signal }),
    fetchCoursePage({ page: 1, signal }),
  ]);
  const remainingPages = await Promise.all(
    Array.from({ length: Math.max(0, firstPage.totalPages - 1) }, (_, index) =>
      fetchCoursePage({ page: index + 2, signal }),
    ),
  );
  const allCourses = [firstPage, ...remainingPages].flatMap(
    ({ courses }) => courses,
  );

  return {
    categories: readCategoryNames(categoryResult),
    levels: [...new Set(allCourses.map(({ level }) => level))]
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b)),
  };
}
