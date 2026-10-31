"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";
import { showToast } from "@/lib/toast";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

function readEnrollmentPhoneNumber(result) {
  const candidates = [
    result,
    result?.data,
    result?.result,
    result?.data?.data,
    result?.result?.data,
  ].filter((candidate) => candidate && typeof candidate === "object");
  const phoneNumber = candidates
    .map((candidate) => candidate.phoneNumber)
    .find((value) => typeof value === "string" || typeof value === "number");

  if (phoneNumber == null || !String(phoneNumber).trim()) {
    throw new Error("The enrollment API did not return a WhatsApp phone number.");
  }
  return String(phoneNumber);
}

async function createCourseEnrollment(courseId, signal) {
  const result = await apiRequest(`/enrollments/${encodeURIComponent(courseId)}`, {
    method: "POST",
    signal,
  });
  return readEnrollmentPhoneNumber(result);
}

export function ProtectedWhatsAppButton({ course }) {
  const router = useRouter();
  const handledIntent = useRef(false);
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("intent") !== "whatsapp" || handledIntent.current) return;
    handledIntent.current = true;

    const controller = new AbortController();
    apiRequest("/users/me", { signal: controller.signal })
      .then(() => createCourseEnrollment(course.id, controller.signal))
      .then((phoneNumber) =>
        window.location.assign(buildWhatsAppUrl(course, phoneNumber)),
      )
      .catch((error) => {
        if (controller.signal.aborted) return;
        if (error.status === 401 || error.status === 403) {
          const next = `${window.location.pathname}${window.location.search}`;
          router.replace(`/login?next=${encodeURIComponent(next)}`);
          return;
        }
        showToast("Could not start WhatsApp enrollment", error.message);
      });

    return () => controller.abort();
  }, [course, router]);

  async function startEnrollment() {
    if (isStarting) return;
    setIsStarting(true);
    try {
      await apiRequest("/users/me");
      const phoneNumber = await createCourseEnrollment(course.id);
      window.location.assign(buildWhatsAppUrl(course, phoneNumber));
    } catch (error) {
      if (error.status === 401 || error.status === 403) {
        const next = `/courses/${encodeURIComponent(course.id)}?intent=whatsapp`;
        router.push(`/login?next=${encodeURIComponent(next)}`);
        return;
      }
      showToast("Could not start WhatsApp enrollment", error.message);
    } finally {
      setIsStarting(false);
    }
  }

  return (
    <button
      type="button"
      onClick={startEnrollment}
      disabled={isStarting}
      className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-3.5 text-center text-sm font-extrabold text-white shadow-md transition hover:bg-[#1ebe5b] disabled:cursor-wait disabled:opacity-70"
    >
      <i
        className={`fa-brands ${isStarting ? "fa-spinner fa-spin" : "fa-whatsapp"} text-lg`}
        aria-hidden="true"
      />
      {isStarting ? "Opening WhatsApp..." : "I want to start this course"}
    </button>
  );
}
