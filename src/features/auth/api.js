import { apiRequest } from "@/lib/api";

export async function requestPasswordReset(identifier) {
  return apiRequest("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ identifier }),
  });
}

export async function submitPasswordReset(token, newPassword) {
  return apiRequest("/auth/reset", {
    method: "POST",
    body: JSON.stringify({ token, newPassword }),
  });
}

export function getResponseMessage(result) {
  if (typeof result === "string") return result;
  return (
    result?.message ||
    result?.data?.message ||
    result?.result?.message ||
    ""
  );
}
