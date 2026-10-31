"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { showToast } from "@/lib/toast";
import { LEAD_STATUSES } from "../constants";
import {
  deleteEnrollment,
  fetchCourseEnrollments,
  updateEnrollmentStatus,
} from "../api";
import { leadStatusClasses } from "../utils";

export function CourseEnrollmentsModal({ course, onClose }) {
  return (
    <Modal
      open={Boolean(course)}
      onClose={onClose}
      title={course ? `${course.title} enrollments` : "Course enrollments"}
      variant="admin"
      maxWidth="max-w-5xl"
      padding="p-5 sm:p-7"
    >
      {course && (
        <CourseEnrollmentsDialog
          key={course.id}
          course={course}
          onClose={onClose}
        />
      )}
    </Modal>
  );
}

function CourseEnrollmentsDialog({ course, onClose }) {
  const courseId = course.id;
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryKey, setRetryKey] = useState(0);
  const [updatingId, setUpdatingId] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deletingId, setDeletingId] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    fetchCourseEnrollments(courseId, controller.signal)
      .then(setEnrollments)
      .catch((requestError) => {
        if (!controller.signal.aborted) {
          setError(requestError.message || "Could not load course enrollments.");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [courseId, retryKey]);

  async function handleStatusChange(enrollmentId, status) {
    if (updatingId) return;
    setUpdatingId(enrollmentId);
    setError("");
    try {
      await updateEnrollmentStatus(enrollmentId, status);
      setEnrollments((current) =>
        current.map((enrollment) =>
          enrollment.id === enrollmentId ? { ...enrollment, status } : enrollment,
        ),
      );
      showToast("Enrollment updated", `Status changed to ${status}.`);
    } catch (requestError) {
      setError(requestError.message || "Could not update enrollment status.");
    } finally {
      setUpdatingId("");
    }
  }

  async function handleDeleteEnrollment() {
    if (!deleteTarget || deletingId) return;
    setDeletingId(deleteTarget.id);
    setError("");
    try {
      await deleteEnrollment(deleteTarget.id);
      setEnrollments((current) =>
        current.filter((enrollment) => enrollment.id !== deleteTarget.id),
      );
      showToast(
        "Enrollment deleted",
        `${deleteTarget.name}'s enrollment was deleted successfully.`,
      );
      setDeleteTarget(null);
    } catch (requestError) {
      setError(requestError.message || "Could not delete the enrollment.");
      setDeleteTarget(null);
    } finally {
      setDeletingId("");
    }
  }

  return (
    <div className="space-y-5">
          <header className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-primary">
                Course enrollments
              </p>
              <h2 className="mt-1 text-2xl font-extrabold text-brand-dark">
                {course.title}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close enrollments"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-800"
            >
              <i className="fa-solid fa-xmark" aria-hidden="true" />
            </button>
          </header>

          {error && (
            <div
              role="alert"
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            >
              <span>{error}</span>
              {loading === false && enrollments.length === 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setLoading(true);
                    setError("");
                    setRetryKey((key) => key + 1);
                  }}
                  className="font-bold underline underline-offset-2"
                >
                  Retry
                </button>
              )}
            </div>
          )}

          {loading ? (
            <p
              className="flex items-center gap-2 rounded-xl bg-slate-50 p-6 text-sm text-slate-500"
              role="status"
            >
              <i className="fa-solid fa-spinner animate-spin" aria-hidden="true" />
              Loading enrollments...
            </p>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th scope="col" className="px-4 py-3">Student</th>
                    <th scope="col" className="px-4 py-3">Phone</th>
                    <th scope="col" className="px-4 py-3">Email</th>
                    <th scope="col" className="px-4 py-3">Course</th>
                    <th scope="col" className="px-4 py-3">Status</th>
                    <th scope="col" className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {enrollments.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-8 text-center text-sm text-slate-400"
                      >
                        No enrollments for this course yet.
                      </td>
                    </tr>
                  ) : (
                    enrollments.map((enrollment) => (
                      <tr key={enrollment.id} className="hover:bg-slate-50/70">
                        <th
                          scope="row"
                          className="px-4 py-3 font-semibold text-brand-dark"
                        >
                          {enrollment.name}
                        </th>
                        <td className="px-4 py-3 text-slate-600">
                          {enrollment.phone}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {enrollment.email}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {enrollment.courseName}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`rounded-md px-2 py-1 text-[11px] font-semibold ${leadStatusClasses(enrollment.status)}`}
                          >
                            {enrollment.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                          <select
                            aria-label={`Status for ${enrollment.name}`}
                            value={enrollment.status}
                            disabled={
                              updatingId === enrollment.id ||
                              deletingId === enrollment.id
                            }
                            onChange={(event) =>
                              handleStatusChange(
                                enrollment.id,
                                event.target.value,
                              )
                            }
                            className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-medium text-slate-700 disabled:opacity-50"
                          >
                            {LEAD_STATUSES.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(enrollment)}
                            disabled={Boolean(deletingId || updatingId)}
                            aria-label={`Delete enrollment for ${enrollment.name}`}
                            title="Delete enrollment"
                            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-rose-600 transition hover:bg-rose-50 disabled:cursor-wait disabled:opacity-50"
                          >
                            <i className="fa-solid fa-trash-can" aria-hidden="true" />
                          </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
          <Modal
            open={Boolean(deleteTarget)}
            onClose={() => {
              if (!deletingId) setDeleteTarget(null);
            }}
            title="Confirm enrollment deletion"
            variant="admin"
            maxWidth="max-w-md"
          >
            <div className="text-center">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
                <i className="fa-solid fa-trash-can" aria-hidden="true" />
              </span>
              <h3 className="mt-4 text-lg font-extrabold text-brand-dark">
                Delete this enrollment?
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                {deleteTarget
                  ? `Delete ${deleteTarget.name}'s enrollment in ${deleteTarget.courseName}?`
                  : ""}
              </p>
              <div className="mt-6 flex flex-col-reverse justify-center gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  disabled={Boolean(deletingId)}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteEnrollment}
                  disabled={Boolean(deletingId)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-rose-700 disabled:cursor-wait disabled:opacity-60"
                >
                  {deletingId ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin" aria-hidden="true" />
                      Deleting...
                    </>
                  ) : (
                    "Delete enrollment"
                  )}
                </button>
              </div>
            </div>
          </Modal>
    </div>
  );
}
