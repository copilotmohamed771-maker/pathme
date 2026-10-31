import { apiRequest, getAuthUser, updateAuthUser } from "@/lib/api";

export const ADMIN_COURSES_PAGE_SIZE = 6;
export const ADMIN_COURSE_LEVELS = [
  "BEGINNER",
  "INTERMEDIATE",
  "ADVANCED",
  "ALLGRADES",
];

export function getAuthUserFromResult(result) {
  const authData = result?.data || result?.result || result;
  return authData?.user || authData?.profile || result?.user || null;
}

export function hasAdminRole(user) {
  if (!user || typeof user !== "object") return false;
  const roles = [
    user.role,
    ...(Array.isArray(user.roles) ? user.roles : []),
    ...(Array.isArray(user.authorities) ? user.authorities : []),
  ];
  return roles.some((role) => {
    const name =
      typeof role === "string" ? role : role?.authority || role?.name;
    return typeof name === "string" && name.toUpperCase().replace(/^ROLE_/, "") === "ADMIN";
  });
}

export async function fetchAdminAccount(signal) {
  const storedUser = getAuthUser();
  const storedId = storedUser?.id ?? storedUser?.userId ?? storedUser?._id;
  const result = await apiRequest("/users/me", { signal });
  const candidates = [
    result?.data?.user,
    result?.data?.profile,
    result?.data,
    result?.result?.user,
    result?.result?.profile,
    result?.result,
    result?.user,
    result?.profile,
    result,
  ].filter((candidate) => candidate && typeof candidate === "object");
  const account = candidates.find(
    (candidate) =>
      candidate.id != null || candidate.userId != null || candidate._id != null,
  );
  const accountWithPhone = candidates.find(
    (candidate) =>
      candidate.phone != null || candidate.phoneNumber != null,
  );
  const id = account?.id ?? account?.userId ?? account?._id ?? storedId;

  if (id == null) {
    throw new Error("The current admin response did not include a user ID.");
  }

  return {
    id: String(id),
    phone: String(
      accountWithPhone?.phone ??
        accountWithPhone?.phoneNumber ??
        storedUser?.phone ??
        storedUser?.phoneNumber ??
        "",
    ),
  };
}

export async function updateAdminPhone(userId, phone) {
  const result = await apiRequest(
    `/users/me/admin/${encodeURIComponent(userId)}/phone`,
    {
      method: "PATCH",
      body: JSON.stringify({ phoneNumber: phone }),
    },
  );
  const user = getAuthUser();
  if (user) updateAuthUser({ ...user, phone });
  return result;
}

export async function updateAdminPassword(userId, newPassword) {
  return apiRequest(
    `/users/me/admin/${encodeURIComponent(userId)}/password`,
    {
      method: "PATCH",
      body: JSON.stringify({ newPassword }),
    },
  );
}

function readCoursePage(result, page) {
  const candidates = [
    result,
    result?.data,
    result?.result,
    result?.data?.data,
    result?.result?.data,
  ].filter((candidate) => candidate && typeof candidate === "object");
  const pageResult = candidates.find(
    (candidate) =>
      Array.isArray(candidate) ||
      Array.isArray(candidate.content) ||
      Array.isArray(candidate.courses),
  );
  const courses = Array.isArray(pageResult)
    ? pageResult
    : pageResult?.content || pageResult?.courses;
  if (!courses) {
    throw new Error("The courses API returned an unexpected response.");
  }
  const totalElements = Number.isInteger(pageResult.totalElements)
    ? pageResult.totalElements
    : courses.length;
  const totalPages = Number.isInteger(pageResult.totalPages)
    ? Math.max(1, pageResult.totalPages)
    : Math.max(1, Math.ceil(totalElements / ADMIN_COURSES_PAGE_SIZE));

  return {
    courses: courses
      .slice(0, ADMIN_COURSES_PAGE_SIZE)
      .map(normalizeCourse),
    page,
    totalPages,
    totalElements,
    first: typeof pageResult.first === "boolean" ? pageResult.first : page <= 1,
    last:
      typeof pageResult.last === "boolean"
        ? pageResult.last
        : page >= totalPages,
  };
}

function readCategories(result) {
  const categoryResult = result?.data || result?.result || result;
  const rows = Array.isArray(categoryResult)
    ? categoryResult
    : categoryResult?.content ||
      categoryResult?.categories ||
      categoryResult?.data?.content;

  if (!Array.isArray(rows)) {
    throw new Error("The categories API returned an unexpected response.");
  }

  return rows
    .map((category) => {
      if (typeof category === "string") {
        return { id: "", name: category.trim() };
      }
      return {
        id: String(category?.id ?? category?.categoryId ?? ""),
        name: String(category?.name ?? category?.categoryName ?? "").trim(),
      };
    })
    .filter((category) => category.name)
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function fetchAdminCategories(signal) {
  return readCategories(await apiRequest("/categories", { signal }));
}

export async function createAdminCategory(name) {
  const result = await apiRequest("/categories", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
  const categoryData = result?.data || result?.result || result;
  const createdCategory =
    categoryData?.category || categoryData?.data?.category || categoryData;
  const createdId = createdCategory?.id ?? createdCategory?.categoryId;
  const createdName =
    createdCategory?.name ?? createdCategory?.categoryName ?? name;

  if (createdId != null && String(createdId).trim()) {
    return { id: String(createdId), name: String(createdName).trim() };
  }

  const categories = await fetchAdminCategories();
  const category = categories.find(
    (item) => item.name.toLowerCase() === name.toLowerCase(),
  );
  if (!category?.id) {
    throw new Error(
      "The category was created, but the categories API did not return its ID.",
    );
  }
  return category;
}

function createCourseFormData({ course, courseImg, roadmapImg }) {
  const body = new FormData();
  body.append(
    "data",
    new Blob([JSON.stringify(course)], { type: "application/json" }),
  );
  if (courseImg) body.append("courseImg", courseImg);
  if (roadmapImg) body.append("roadmapImg", roadmapImg);
  return body;
}

export async function createAdminCourse(courseData) {
  return apiRequest("/courses", {
    method: "POST",
    body: createCourseFormData(courseData),
  });
}

export async function updateAdminCourse({ id, ...courseData }) {
  return apiRequest(`/courses/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: createCourseFormData(courseData),
  });
}

export async function deleteAdminCourse(courseId) {
  return apiRequest(`/courses/${encodeURIComponent(courseId)}`, {
    method: "DELETE",
  });
}

export async function duplicateAdminCourse(courseId) {
  const result = await apiRequest(
    `/courses/${encodeURIComponent(courseId)}/duplicate`,
    { method: "POST" },
  );
  const candidates = [
    result,
    result?.data,
    result?.result,
    result?.data?.data,
    result?.result?.data,
  ].filter((candidate) => candidate && typeof candidate === "object");
  const duplicatedCourse = candidates
    .map(
      (candidate) =>
        candidate.course || candidate.duplicateCourse || candidate,
    )
    .find((candidate) => candidate.id != null || candidate._id != null);

  if (!duplicatedCourse) {
    throw new Error(
      "The duplicate course API did not return the new course details.",
    );
  }

  return normalizeCourse(duplicatedCourse);
}

export async function updateAdminCourseStatus(courseId, status) {
  return apiRequest(`/courses/${encodeURIComponent(courseId)}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

function normalizeEnrollment(enrollment) {
  if (!enrollment || typeof enrollment !== "object" || Array.isArray(enrollment)) {
    throw new Error("The enrollments API returned an invalid enrollment.");
  }

  const statusValue = String(enrollment.status || "").toLowerCase();
  const status = {
    new: "New",
    contacted: "Contacted",
    enrolled: "Enrolled",
  }[statusValue];

  if (!status) {
    throw new Error("The enrollments API returned an unsupported enrollment status.");
  }

  const student = enrollment.student || enrollment.user || {};
  const course = enrollment.course || {};
  const id = enrollment.id ?? enrollment.enrollmentId ?? enrollment._id;

  if (id == null) {
    throw new Error("The enrollments API returned an enrollment without an ID.");
  }

  return {
    ...enrollment,
    id: String(id),
    name:
      enrollment.studentName ||
      enrollment.name ||
      student.fullName ||
      student.name ||
      [student.firstName, student.lastName].filter(Boolean).join(" ") ||
      "Unknown student",
    phone:
      enrollment.phone ||
      enrollment.phoneNumber ||
      student.phone ||
      student.phoneNumber ||
      "—",
    email: enrollment.email || student.email || "—",
    courseName:
      enrollment.courseName ||
      course.name ||
      course.title ||
      course.courseName ||
      "Course",
    status,
  };
}

export async function fetchCourseEnrollments(courseId, signal) {
  const result = await apiRequest(
    `/enrollments/course/${encodeURIComponent(courseId)}`,
    { signal },
  );
  const candidates = [
    result,
    result?.data,
    result?.result,
    result?.data?.data,
    result?.result?.data,
  ].filter((candidate) => candidate && typeof candidate === "object");
  const rows = candidates
    .map((candidate) =>
      Array.isArray(candidate)
        ? candidate
        : candidate.content || candidate.enrollments || candidate.data,
    )
    .find(Array.isArray);

  if (!rows) {
    throw new Error("The enrollments API returned an unexpected response.");
  }

  return rows.map(normalizeEnrollment);
}

export async function updateEnrollmentStatus(enrollmentId, status) {
  return apiRequest(
    `/enrollments/${encodeURIComponent(enrollmentId)}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({ status }),
    },
  );
}

export async function deleteEnrollment(enrollmentId) {
  return apiRequest(`/enrollments/${encodeURIComponent(enrollmentId)}`, {
    method: "DELETE",
  });
}

function readOutcomes(value) {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  if (typeof value === "string") {
    return value
      .split(/[\n,;]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

function readActiveStatus(course) {
  const active = course.isActive ?? course.active ?? course.published;
  if (typeof active === "boolean") return active;
  if (typeof active === "string") {
    return ["true", "active", "published"].includes(active.toLowerCase());
  }

  const status = String(course.status || "").toLowerCase();
  return status ? ["active", "published", "publish"].includes(status) : true;
}

function normalizeCourse(course) {
  if (!course || typeof course !== "object" || Array.isArray(course)) {
    throw new Error("The courses API returned an invalid course.");
  }

  const id = course.id ?? course._id;
  if (id == null) {
    throw new Error("The courses API returned a course without an ID.");
  }

  const category = course.categoryName || course.category?.name || course.category;
  const outcomes =
    course.outcomes ?? course.whatYouWillLearn ?? course.learnHighlights;
  const status = String(course.status || "").toUpperCase();
  const isActive = readActiveStatus(course);

  return {
    ...course,
    id: String(id),
    title: String(course.name || course.title || "Untitled course"),
    category:
      typeof category === "string" && category.trim()
        ? category
        : "Uncategorized",
    price:
      course.price == null || course.price === ""
        ? "Contact for price"
        : String(course.price),
    priceValue: course.price,
    discountedPriceValue:
      course.discountedPrice == null || course.discountedPrice === ""
        ? null
        : Number(course.discountedPrice),
    level: String(course.level || "All levels"),
    discount: Number.isFinite(
      Number(
        course.discount ??
          course.discountPercentage ??
          course.discountPercent ??
          0,
      ),
    )
      ? Number(
          course.discount ??
            course.discountPercentage ??
            course.discountPercent ??
            0,
        )
      : 0,
    duration: String(course.duration || "Flexible"),
    image: course.courseImg || course.courseImage || course.image || "",
    description: String(course.description ?? ""),
    descriptionAr: String(course.descriptionAr ?? ""),
    outcomes: readOutcomes(outcomes),
    status: ["PUBLISH", "PUBLISHED", "ACTIVE"].includes(status)
      ? "PUBLISH"
      : isActive
        ? "PUBLISH"
        : "DRAFT",
    isActive,
  };
}

export async function fetchAdminCourse(courseId, signal) {
  const result = await apiRequest(
    `/courses/admin/preview/${encodeURIComponent(courseId)}`,
    { signal },
  );
  const candidates = [];
  const pending = [result];
  const visited = new Set();

  while (pending.length) {
    const candidate = pending.shift();
    if (!candidate || typeof candidate !== "object" || visited.has(candidate)) {
      continue;
    }
    visited.add(candidate);

    if (!Array.isArray(candidate)) candidates.push(candidate);
    for (const key of ["course", "data", "result"]) {
      if (candidate[key] && typeof candidate[key] === "object") {
        pending.push(candidate[key]);
      }
    }
  }
  const expectedId = String(courseId);
  const course = candidates.find(
    (candidate) => String(candidate.id ?? candidate._id ?? "") === expectedId,
  );

  if (!course) {
    throw new Error(
      "The course API did not return the requested course details.",
    );
  }

  return normalizeCourse(course);
}

export async function fetchAdminCourses({
  page = 1,
  filters = {},
  signal,
} = {}) {
  const params = new URLSearchParams();
  const search = filters.query?.trim();
  if (search) params.set("search", search);
  filters.categories?.forEach((category) => {
    if (category) params.append("categories", category);
  });
  filters.levels?.forEach((level) => {
    if (level) params.append("levels", level);
  });
  ["createdFrom", "createdTo", "updatedFrom", "updatedTo"].forEach((field) => {
    if (filters[field]) params.set(field, filters[field]);
  });
  if (filters.status && filters.status !== "all") {
    params.set("status", filters.status);
  }
  if (filters.sort) params.set("sort", filters.sort);
  params.set("page", String(page));
  params.set("size", String(ADMIN_COURSES_PAGE_SIZE));

  const result = await apiRequest(`/courses/admin/search?${params}`, {
    method: "GET",
    signal,
  });
  return readCoursePage(result, page);
}
