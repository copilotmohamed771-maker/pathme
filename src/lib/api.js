const API_BASE_URL = "/backend";
const API_REQUEST_TIMEOUT_MS = 15_000;
export const AUTH_SESSION_EVENT = "pathme:auth-session-change";
let sessionActive = false;

export function getAuthUser() {
  if (typeof window === "undefined") return null;
  try {
    const user = window.sessionStorage.getItem("pathme.user");
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
}

export function updateAuthUser(user) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem("pathme.user", JSON.stringify(user));
  window.dispatchEvent(new Event(AUTH_SESSION_EVENT));
}

export function getApiUrl(path = "") {
  return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function saveAuthSession(authResult) {
  if (typeof window === "undefined") return;

  const authData = authResult?.data || authResult?.result || authResult;
  const accessToken =
    authData?.accessToken ||
    authData?.access_token ||
    authData?.token ||
    authData?.jwt;
  if (accessToken) {
    window.sessionStorage.setItem("pathme.accessToken", accessToken);
  } else {
    window.sessionStorage.removeItem("pathme.accessToken");
  }
  const user = authData?.user || authData?.profile || authResult?.user;
  if (user && typeof user === "object") {
    window.sessionStorage.setItem("pathme.user", JSON.stringify(user));
  } else {
    window.sessionStorage.removeItem("pathme.user");
  }
  sessionActive = true;
  window.localStorage.removeItem("pathme.accessToken");
  window.localStorage.removeItem("pathme.user");
  window.dispatchEvent(new Event(AUTH_SESSION_EVENT));
}

export function clearAuthSession() {
  if (typeof window === "undefined") return;
  sessionActive = false;
  window.sessionStorage.removeItem("pathme.accessToken");
  window.sessionStorage.removeItem("pathme.user");
  document.cookie = "pathme.session=; Path=/; SameSite=Lax; Max-Age=0";
  window.localStorage.removeItem("pathme.accessToken");
  window.localStorage.removeItem("pathme.user");
  window.dispatchEvent(new Event(AUTH_SESSION_EVENT));
}

export function hasAuthSession() {
  return Boolean(
    sessionActive ||
    (typeof window !== "undefined" &&
      (window.sessionStorage.getItem("pathme.accessToken") || getAuthUser())),
  );
}

export async function apiRequest(path, options = {}) {
  const headers = new Headers(options.headers || {});
  if (!headers.has("lang")) {
    const savedLanguage =
      typeof window !== "undefined"
        ? window.localStorage.getItem("pathme-language")
        : null;
    headers.set("lang", savedLanguage === "ar" ? "AR" : "EN");
  }
  if (typeof window !== "undefined" && !headers.has("Authorization")) {
    const accessToken = window.sessionStorage.getItem("pathme.accessToken");
    if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);
  }
  if (
    options.body &&
    !(options.body instanceof FormData) &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json");
  }

  const requestController = new AbortController();
  let timedOut = false;
  const abortRequest = () => requestController.abort();
  if (options.signal?.aborted) {
    abortRequest();
  } else {
    options.signal?.addEventListener("abort", abortRequest, { once: true });
  }
  const timeoutId = setTimeout(() => {
    timedOut = true;
    requestController.abort();
  }, API_REQUEST_TIMEOUT_MS);

  let response;
  let result;
  try {
    response = await fetch(getApiUrl(path), {
      ...options,
      headers,
      credentials: "include",
      signal: requestController.signal,
    });
    const contentType = response.headers.get("content-type") || "";
    result = contentType.includes("application/json")
      ? await response.json()
      : await response.text();
  } catch (requestError) {
    if (timedOut) {
      throw new Error(
        "The API request timed out. Check the connection and try again.",
      );
    }
    if (options.signal?.aborted) throw requestError;
    throw new Error(
      "Could not reach the API. Check the backend URL and that the server is running.",
    );
  } finally {
    clearTimeout(timeoutId);
    options.signal?.removeEventListener("abort", abortRequest);
  }

  if (!response.ok) {
    const error = new Error(
      typeof result === "string"
        ? result
        : result.message ||
            result.error ||
            `Request failed (${response.status}).`,
    );

    if (result && typeof result === "object") {
      error.status = result.status || response.status;
      error.path = result.path;
      error.errors = result.errors;
    }

    throw error;
  }

  return result;
}

export function getGoogleAuthUrl(redirectUri, state) {
  const url = new URL(getApiUrl("/auth/google"), window.location.origin);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("state", state);
  return url.toString();
}

export function getSafeNextPath(path, fallback = "/courses") {
  if (
    typeof path !== "string" ||
    !path.startsWith("/") ||
    path.startsWith("//")
  ) {
    return fallback;
  }
  return path;
}
