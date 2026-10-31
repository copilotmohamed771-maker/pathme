"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Toaster } from "@/components/ui/Toaster";
import { apiRequest, clearAuthSession } from "@/lib/api";
import { showToast } from "@/lib/toast";

import {
  createAdminCourse,
  deleteAdminCourse,
  duplicateAdminCourse,
  ADMIN_COURSES_PAGE_SIZE,
  fetchAdminCategories,
  fetchAdminCourse,
  fetchAdminCourses,
  updateAdminCourse,
  updateAdminCourseStatus,
} from "../api";
import { filterAdminCourses } from "../utils";
import { AdminHeader } from "./AdminHeader";
import { AdminAccountSettingsModal } from "./AdminAccountSettingsModal";
import { CourseCards } from "./CourseCards";
import { CourseEnrollmentsModal } from "./CourseEnrollmentsModal";
import { CourseFormModal } from "./CourseFormModal";
import { CourseTable } from "./CourseTable";
import { CourseToolbar } from "./CourseToolbar";
import { StatsRow } from "./StatsRow";

function readFiltersFromUrl() {
  const params =
    typeof window === "undefined"
      ? new URLSearchParams()
      : new URLSearchParams(window.location.search);
  return {
    query: params.get("search") || "",
    categories: params.getAll("categories"),
    levels: params.getAll("levels"),
    createdFrom: params.get("createdFrom") || "",
    createdTo: params.get("createdTo") || "",
    updatedFrom: params.get("updatedFrom") || "",
    updatedTo: params.get("updatedTo") || "",
    status: {
      active: "PUBLISH",
      draft: "DRAFT",
    }[params.get("status")] || params.get("status") || "all",
    sort: params.get("sort") || "DESC",
  };
}

function readPageFromUrl() {
  if (typeof window === "undefined") return 1;
  return Math.max(
    1,
    Number(new URLSearchParams(window.location.search).get("page")) || 1,
  );
}

export function AdminDashboard() {
  const router = useRouter();
  const [filters, setFilters] = useState(readFiltersFromUrl);
  const [appliedFilters, setAppliedFilters] = useState(readFiltersFromUrl);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState("");
  const [courses, setCourses] = useState([]);
  const [coursePage, setCoursePage] = useState({
    page: 1,
    totalPages: 1,
    totalElements: 0,
    first: true,
    last: true,
  });
  const [viewMode, setViewMode] = useState("grid");
  const [formTarget, setFormTarget] = useState(null);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [coursesError, setCoursesError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [page, setPage] = useState(readPageFromUrl);
  const [updatingCourseId, setUpdatingCourseId] = useState("");
  const [duplicatingCourseId, setDuplicatingCourseId] = useState("");
  const [editingCourseId, setEditingCourseId] = useState("");
  const [courseActionError, setCourseActionError] = useState("");
  const [enrollmentCourse, setEnrollmentCourse] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteError, setDeleteError] = useState("");
  const [isDeletingCourse, setIsDeletingCourse] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [accountSettingsOpen, setAccountSettingsOpen] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    fetchAdminCategories(controller.signal)
      .then((result) => {
        setCategories(result);
        setCategoriesError("");
      })
      .catch((error) => {
        if (!controller.signal.aborted) {
          setCategoriesError(error.message || "Could not load categories.");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setCategoriesLoading(false);
      });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    fetchAdminCourses({ page, filters: appliedFilters, signal: controller.signal })
      .then((result) => {
        setCourses(result.courses);
        setCoursePage(result);
      })
      .catch((error) => {
        if (!controller.signal.aborted) {
          setCoursesError(error.message || "Could not load courses.");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setCoursesLoading(false);
      });
    return () => controller.abort();
  }, [appliedFilters, page, refreshKey]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.query.trim()) params.set("search", filters.query.trim());
    filters.categories.forEach((category) => params.append("categories", category));
    filters.levels.forEach((level) => params.append("levels", level));
    ["createdFrom", "createdTo", "updatedFrom", "updatedTo"].forEach(
      (field) => {
        if (filters[field]) params.set(field, filters[field]);
      },
    );
    if (filters.status !== "all") params.set("status", filters.status);
    if (filters.sort) params.set("sort", filters.sort);
    params.set("page", String(page));
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}?${params.toString()}`,
    );
  }, [filters, page]);

  function refreshCourses() {
    setCoursesLoading(true);
    setCoursesError("");
    setPage(1);
    setRefreshKey((key) => key + 1);
  }

  async function handleLogout() {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await apiRequest("/auth/logout", { method: "POST" });
      clearAuthSession();
      router.replace("/admin/login");
      router.refresh();
    } catch (error) {
      showToast("Could not log out", error.message || "Please try again.");
    } finally {
      setIsLoggingOut(false);
    }
  }

  async function handleDeleteCourse() {
    if (!deleteTarget || isDeletingCourse) return;
    setIsDeletingCourse(true);
    setDeleteError("");
    try {
      await deleteAdminCourse(deleteTarget.id);
      const deletedTitle = deleteTarget.title;
      setDeleteTarget(null);
      setCoursesLoading(true);
      setCoursesError("");
      setPage(1);
      setRefreshKey((key) => key + 1);
      showToast("Course deleted", `${deletedTitle} was deleted successfully.`);
    } catch (error) {
      setDeleteError(error.message || "Could not delete the course.");
    } finally {
      setIsDeletingCourse(false);
    }
  }

  function handleFiltersChange(nextFilters) {
    setFilters(nextFilters);
    if (page !== 1) {
      setCoursesLoading(true);
      setCoursesError("");
      setPage(1);
    }
  }

  function handleApplyFilters(nextFilters = filters) {
    setFilters(nextFilters);
    setAppliedFilters({ ...nextFilters });
    setCoursesLoading(true);
    setCoursesError("");
    setPage(1);
  }

  function handleStatusChange(status) {
    const nextFilters = { ...filters, status };
    setFilters(nextFilters);
    setAppliedFilters(nextFilters);
    setCoursesLoading(true);
    setCoursesError("");
    setPage(1);
  }

  const visibleCourses = filterAdminCourses(courses, appliedFilters);

  async function handleToggleActive(id) {
    const course = courses.find((item) => item.id === id);
    if (!course || updatingCourseId) return;

    const status = course.isActive ? "DRAFT" : "PUBLISH";
    setUpdatingCourseId(id);
    setCourseActionError("");
    try {
      await updateAdminCourseStatus(id, status);
      setCourses((current) =>
        current.map((item) =>
          item.id === id
            ? { ...item, status, isActive: status === "PUBLISH" }
            : item,
        ),
      );
      showToast(
        status === "PUBLISH" ? "Course published" : "Course saved as draft",
        `${course.title} was updated successfully.`,
      );
    } catch (error) {
      setCourseActionError(
        error.message || "Could not update the course status.",
      );
    } finally {
      setUpdatingCourseId("");
    }
  }

  async function handleDuplicateCourse(id) {
    if (duplicatingCourseId) return;
    const originalCourse = courses.find((course) => course.id === id);
    if (!originalCourse) return;

    setDuplicatingCourseId(id);
    setCourseActionError("");
    try {
      const duplicatedCourseResult = await duplicateAdminCourse(id);
      const duplicatedCourse = {
        ...duplicatedCourseResult,
        descriptionAr:
          duplicatedCourseResult.descriptionAr || originalCourse.descriptionAr,
      };
      if (duplicatedCourse.id === originalCourse.id) {
        throw new Error("The duplicate course API returned the original course.");
      }
      setCourses((current) => [
        duplicatedCourse,
        ...current
          .filter((course) => course.id !== duplicatedCourse.id)
          .slice(0, ADMIN_COURSES_PAGE_SIZE - 1),
      ]);
      setCoursePage((current) => ({
        ...current,
        totalElements: current.totalElements + 1,
        totalPages: Math.max(
          1,
          Math.ceil((current.totalElements + 1) / ADMIN_COURSES_PAGE_SIZE),
        ),
        first: current.page <= 1,
        last:
          current.page >=
          Math.max(
            1,
            Math.ceil(
              (current.totalElements + 1) / ADMIN_COURSES_PAGE_SIZE,
            ),
          ),
      }));
      showToast(
        "Course duplicated",
        `${duplicatedCourse.title} is ready to manage.`,
      );
    } catch (error) {
      setCourseActionError(error.message || "Could not duplicate the course.");
    } finally {
      setDuplicatingCourseId("");
    }
  }

  async function handleEditCourse(course) {
    if (editingCourseId) return;

    setEditingCourseId(course.id);
    setCourseActionError("");
    try {
      const fullCourse = await fetchAdminCourse(course.id);
      setFormTarget({
        ...fullCourse,
        description: fullCourse.description || course.description || "",
        descriptionAr: fullCourse.descriptionAr || course.descriptionAr || "",
      });
    } catch (error) {
      setCourseActionError(error.message || "Could not load the course details.");
    } finally {
      setEditingCourseId("");
    }
  }

  const actions = {
    onToggleActive: handleToggleActive,
    updatingCourseId,
    onDuplicate: handleDuplicateCourse,
    duplicatingCourseId,
    onEdit: handleEditCourse,
    editingCourseId,
    onViewEnrollments: setEnrollmentCourse,
    onDelete: (id) => {
        const course = courses.find((item) => item.id === id);
        if (course) {
          setDeleteTarget(course);
          setDeleteError("");
        }
      },
  };

  async function handleSave(course) {
    if (formTarget === "new") {
      await createAdminCourse(course);
      setFormTarget(null);
      refreshCourses();
      return;
    }

    await updateAdminCourse(course);
    setFormTarget(null);
    refreshCourses();
    showToast("Course updated", "The course details were saved successfully.");
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-admin">
      <AdminHeader
        onAddCourse={() => setFormTarget("new")}
        onOpenSettings={() => setAccountSettingsOpen(true)}
        onLogout={handleLogout}
        isLoggingOut={isLoggingOut}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7 sm:py-9 w-full flex-1 space-y-7">
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-dark via-[#182951] to-brand-primary px-6 py-7 sm:px-8 sm:py-9 text-white shadow-lg shadow-brand-dark/10">
          <div
            className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full bg-brand-innovation/20 blur-3xl"
            aria-hidden="true"
          />
          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-teal-200">
                PathMe · Admin workspace
              </p>
              <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
                Your courses, all in one place.
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">
                Review course details, track publishing status, and keep your
                catalog up to date.
              </p>
            </div>
            <button
              type="button"
              onClick={refreshCourses}
              disabled={coursesLoading}
              className="inline-flex w-fit items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/20 disabled:cursor-wait disabled:opacity-60"
            >
              <i
                className={`fa-solid fa-rotate ${coursesLoading ? "animate-spin" : ""}`}
                aria-hidden="true"
              />
              {coursesLoading ? "Refreshing..." : "Refresh courses"}
            </button>
          </div>
        </section>

        <StatsRow
          courses={courses}
          totalCourses={coursePage.totalElements}
          coursesLoading={coursesLoading}
        />

        <section
          id="panel-courses"
          className="space-y-4 rounded-3xl border border-slate-200/80 bg-white/70 p-4 shadow-sm sm:p-6"
        >
            <CourseToolbar
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onApplyFilters={handleApplyFilters}
              categories={categories}
              categoriesError={categoriesError}
              categoriesLoading={categoriesLoading}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />
            {courseActionError && (
              <p
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {courseActionError}
              </p>
            )}
            {coursesError ? (
              <div
                role="alert"
                className="flex flex-col gap-4 rounded-2xl border border-red-200 bg-red-50 p-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
                    <i className="fa-solid fa-triangle-exclamation" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-red-900">
                      Courses couldn&apos;t be loaded
                    </p>
                    <p className="mt-1 text-xs leading-5 text-red-700">{coursesError}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={refreshCourses}
                  className="rounded-lg bg-red-600 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-red-700"
                >
                  Try again
                </button>
              </div>
            ) : coursesLoading ? (
              <div
                className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3"
                role="status"
                aria-label="Loading courses"
              >
                {Array.from({ length: 3 }, (_, index) => (
                  <div
                    key={index}
                    className="h-64 animate-pulse rounded-2xl border border-slate-200 bg-white"
                  >
                    <div className="h-28 rounded-t-2xl bg-slate-200" />
                    <div className="space-y-3 p-4">
                      <div className="h-4 w-2/3 rounded bg-slate-200" />
                      <div className="h-3 w-full rounded bg-slate-100" />
                      <div className="h-3 w-4/5 rounded bg-slate-100" />
                    </div>
                  </div>
                ))}
                <span className="sr-only">Loading courses from the server...</span>
              </div>
            ) : viewMode === "grid" ? (
              <>
                <CourseCards courses={visibleCourses} {...actions} />
                <CoursePagination
                  pageData={coursePage}
                  disabled={coursesLoading}
                  onPageChange={(nextPage) => {
                    setCoursesLoading(true);
                    setCoursesError("");
                    setPage(nextPage);
                  }}
                />
              </>
            ) : (
              <>
                <CourseTable courses={visibleCourses} {...actions} />
                <CoursePagination
                  pageData={coursePage}
                  disabled={coursesLoading}
                  onPageChange={(nextPage) => {
                    setCoursesLoading(true);
                    setCoursesError("");
                    setPage(nextPage);
                  }}
                />
              </>
            )}
        </section>
      </main>

      <CourseFormModal
        target={formTarget}
        onClose={() => {
          setFormTarget(null);
          setCourseActionError("");
        }}
        onSave={handleSave}
      />
      <AdminAccountSettingsModal
        open={accountSettingsOpen}
        onClose={() => setAccountSettingsOpen(false)}
      />
      <CourseEnrollmentsModal
        course={enrollmentCourse}
        onClose={() => setEnrollmentCourse(null)}
      />
      <Modal
        open={Boolean(deleteTarget)}
        onClose={() => {
          if (!isDeletingCourse) {
            setDeleteTarget(null);
            setDeleteError("");
          }
        }}
        title="Confirm course deletion"
        variant="admin"
      >
        <div className="text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
            <i className="fa-solid fa-trash-can" aria-hidden="true" />
          </span>
          <h2 className="mt-4 text-lg font-extrabold text-brand-dark">
            Delete this course?
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {deleteTarget
              ? `“${deleteTarget.title}” will be permanently deleted. This action cannot be undone.`
              : ""}
          </p>
          {deleteError && (
            <p
              role="alert"
              className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-left text-sm text-rose-700"
            >
              {deleteError}
            </p>
          )}
          <div className="mt-6 flex flex-col-reverse justify-center gap-2 sm:flex-row">
            <button
              type="button"
              onClick={() => {
                setDeleteTarget(null);
                setDeleteError("");
              }}
              disabled={isDeletingCourse}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDeleteCourse}
              disabled={isDeletingCourse}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-rose-700 disabled:cursor-wait disabled:opacity-60"
            >
              {isDeletingCourse ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin" aria-hidden="true" />
                  Deleting...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-trash-can" aria-hidden="true" />
                  Delete course
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>
      <Toaster />
    </div>
  );
}

function CoursePagination({ pageData, disabled, onPageChange }) {
  if (pageData.totalPages <= 1) return null;

  return (
    <nav
      className="flex items-center justify-center gap-4 pt-2"
      aria-label="Course pages"
    >
      <button
        type="button"
        disabled={disabled || pageData.first}
        onClick={() => onPageChange(Math.max(1, pageData.page - 1))}
        className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-brand-primary transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Previous
      </button>
      <span className="text-sm font-semibold text-slate-500" aria-live="polite">
        Page {pageData.page} of {pageData.totalPages} · {pageData.totalElements}{" "}
        courses
      </span>
      <button
        type="button"
        disabled={disabled || pageData.last}
        onClick={() => onPageChange(pageData.page + 1)}
        className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-brand-primary transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Next
      </button>
    </nav>
  );
}
