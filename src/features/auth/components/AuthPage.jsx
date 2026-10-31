"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { Modal } from "@/components/ui/Modal";
import { ForgotPasswordModal } from "./ForgotPasswordModal";
import {
  apiRequest,
  getSafeNextPath,
  hasAuthSession,
  saveAuthSession,
} from "@/lib/api";
import { useLanguage } from "@/lib/language";

const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

const steps = [
  "Discover your interests",
  "Build real-world skills",
  "Create what’s next",
];

export default function AuthPage({ mode, initialForgotOpen = false }) {
  const { t } = useLanguage();
  const router = useRouter();
  const isRegister = mode === "register";
  const [forgotPasswordOpen, setForgotPasswordOpen] =
    useState(initialForgotOpen);
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [googleError, setGoogleError] = useState("");
  const [googleRoleModalOpen, setGoogleRoleModalOpen] = useState(false);
  const [googleRole, setGoogleRole] = useState("");
  const [googleRoleConfirmed, setGoogleRoleConfirmed] = useState(false);
  const [phoneCountries, setPhoneCountries] = useState([]);
  const [selectedPhoneIso2, setSelectedPhoneIso2] = useState("");
  const [phoneCountriesLoading, setPhoneCountriesLoading] =
    useState(isRegister);
  const [phoneCountriesError, setPhoneCountriesError] = useState("");
  const [phoneCountriesRetry, setPhoneCountriesRetry] = useState(0);

  useEffect(() => {
    if (!isRegister) return undefined;

    const controller = new AbortController();

    apiRequest("/flags", { signal: controller.signal })
      .then((result) => {
        const records = Array.isArray(result)
          ? result
          : Array.isArray(result?.data)
            ? result.data
            : Array.isArray(result?.result)
              ? result.result
              : Array.isArray(result?.flags)
                ? result.flags
                : null;
        const countries = records?.filter(
          (country) =>
            typeof country?.code === "string" &&
            typeof country?.name === "string" &&
            country.code.trim(),
        );

        if (!countries?.length) {
          throw new Error("The country code list was empty or invalid.");
        }

        setPhoneCountries(countries);
        setSelectedPhoneIso2((currentIso2) => {
          if (countries.some((country) => country.iso2 === currentIso2)) {
            return currentIso2;
          }
          return (
            countries.find((country) => country.iso2 === "EG")?.iso2 ??
            countries[0].iso2
          );
        });
      })
      .catch((requestError) => {
        if (!controller.signal.aborted) {
          setPhoneCountriesError(
            requestError.message || "Could not load country calling codes.",
          );
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setPhoneCountriesLoading(false);
      });

    return () => controller.abort();
  }, [isRegister, phoneCountriesRetry]);

  useEffect(() => {
    if (!hasAuthSession()) return;
    const next = getSafeNextPath(
      new URLSearchParams(window.location.search).get("next"),
    );
    router.replace(next);
  }, [router]);

  function fieldBorder(field) {
    const invalidCredentials =
      !isRegister &&
      fieldErrors.BadCredentials &&
      (field === "username" || field === "password");

    return fieldErrors[field] || invalidCredentials
      ? "border-red-500 focus:border-red-500 focus:ring-red-100"
      : "border-gray-200 focus:border-brand-innovation focus:ring-brand-innovation/10";
  }

  function renderFieldError(field) {
    const message =
      fieldErrors[field] ||
      (!isRegister && field === "password" && fieldErrors.BadCredentials);
    if (!message) return null;

    return (
      <p className="mt-1.5 text-xs font-semibold text-red-600" role="alert">
        {Array.isArray(message) ? message.join(", ") : message}
      </p>
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFieldErrors({});

    const values = new FormData(event.currentTarget);
    const getValue = (name) => String(values.get(name) ?? "").trim();
    if (isRegister) {
      const localPhoneNumber = getValue("phoneNumber").replace(/\D/g, "");
      if (!localPhoneNumber) {
        setFieldErrors({ phoneNumber: "Enter your phone number." });
        return;
      }
      if (!selectedPhoneIso2) {
        setFieldErrors({
          phoneNumber: "Select a country calling code before continuing.",
        });
        return;
      }
      if (phoneCountriesLoading || phoneCountriesError) {
        setFieldErrors({
          phoneNumber: "Country calling codes are not ready. Please try again.",
        });
        return;
      }
    }
    setIsSubmitting(true);

    const payload = {
      [isRegister ? "email" : "username"]: getValue(
        isRegister ? "email" : "username",
      ),
      password: String(values.get("password") ?? ""),
    };

    if (isRegister) {
      payload.countryIso2 = selectedPhoneIso2;
      payload.username = getValue("username");
      payload.phoneNumber = getValue("phoneNumber").replace(/\D/g, "");
      payload.role = getValue("role").toUpperCase();
      payload.gender = getValue("gender").toUpperCase();
      payload.age = getValue("age") ? Number(getValue("age")) : "";
    }

    try {
      const authResult = await apiRequest(
        isRegister ? "/auth/register" : "/auth/login",
        {
          method: "POST",
          body: JSON.stringify(payload),
        },
      );
      saveAuthSession(authResult);

      const next = getSafeNextPath(
        new URLSearchParams(window.location.search).get("next"),
        isRegister ? "/" : "/profile",
      );
      window.location.replace(next);
    } catch (error) {
      setFieldErrors(error.errors || {});
      setIsSubmitting(false);
    }
  }

  async function handleGoogleSuccess(credentialResponse) {
    setGoogleError("");
    if (!credentialResponse.credential) {
      setGoogleError("Google did not return an ID token. Please try again.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = { idToken: credentialResponse.credential };
      if (isRegister) payload.role = googleRole;

      const authResult = await apiRequest(
        isRegister ? "/api/auth/google" : "/api/auth/google/login",
        {
          method: "POST",
          body: JSON.stringify(payload),
        },
      );

      // The backend validates the Google token and sets the app's HttpOnly
      // session cookie. Never retain the Google ID token in browser storage.
      saveAuthSession(authResult);
      setGoogleRoleModalOpen(false);

      const next = getSafeNextPath(
        new URLSearchParams(window.location.search).get("next"),
        isRegister ? "/" : "/profile",
      );
      window.location.replace(next);
    } catch (error) {
      const validationErrors = error.errors;
      const firstValidationMessage = validationErrors
        ? Object.values(validationErrors).flat()[0]
        : null;
      setGoogleError(
        firstValidationMessage ||
          error.message ||
          "Google sign-in failed. Please try again.",
      );
      setIsSubmitting(false);
    }
  }

  function handleGoogleError() {
    setGoogleError("Google sign-in was cancelled or could not be completed.");
  }

  return (
    <section className="auth-card-enter grid w-full overflow-hidden rounded-[2rem] border border-white bg-white shadow-[0_28px_90px_-35px_rgba(16,24,47,0.28)] lg:min-h-[650px] lg:grid-cols-[0.92fr_1.08fr]">
      <aside className="auth-panel-enter relative hidden overflow-hidden bg-linear-to-br from-brand-primary via-[#263b7c] to-[#111b3a] p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-12">
        <div
          aria-hidden="true"
          className="absolute -right-28 -top-24 h-80 w-80 rounded-full border border-white/10"
        />
        <div
          aria-hidden="true"
          className="absolute -right-16 -top-12 h-56 w-56 rounded-full border border-white/10"
        />
        <div className="relative z-10">
          <div className="mt-16 max-w-sm">
            <p className="mb-4 text-xs font-extrabold uppercase tracking-[0.22em] text-brand-innovation">
              {t("Learn / Build / Apply")}
            </p>
            <h1 className="text-4xl font-extrabold leading-[1.12] tracking-tight xl:text-5xl">
              {t("Your next big idea starts with a first step.")}
            </h1>
            <p className="mt-5 text-base leading-7 text-blue-100/80">
              {t("Learn practical skills, make things you’re proud of, and find your own path into the future.")}
            </p>
          </div>
        </div>
        <div className="relative z-10 mt-12 rounded-2xl border border-white/15 bg-white/[0.08] p-5 backdrop-blur-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold">{t("Your learning path")}</p>
              <p className="mt-1 text-xs text-blue-100/70">
                {t("Small steps. Big possibilities.")}
              </p>
            </div>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-innovation/20 text-brand-innovation">
              <i className="fa-solid fa-route" aria-hidden="true" />
            </span>
          </div>
          <ol className="space-y-3">
            {steps.map((step, index) => (
              <li
                key={step}
                className="flex items-center gap-3 text-sm text-blue-50/90"
              >
                <span
                  className={`h-2.5 w-2.5 rounded-full ${index === 0 ? "bg-brand-innovation" : index === 1 ? "bg-brand-energy" : "bg-white"}`}
                />
                <span className="font-mono text-[11px] text-blue-100/50">
                  0{index + 1}
                </span>
                <span>{t(step)}</span>
              </li>
            ))}
          </ol>
        </div>
        <p className="relative z-10 mt-8 text-xs text-blue-100/50">
          {t("Made for curious minds and future builders.")}
        </p>
      </aside>

      <div className="flex items-center justify-center px-6 py-10 sm:px-10 sm:py-12 lg:px-12 xl:px-16">
        <div className="w-full max-w-md">
          <div className="mb-8 flex justify-end lg:hidden">
            <span className="rounded-full bg-brand-light px-3 py-1.5 text-xs font-bold text-brand-primary">
              {t("Learn / Build / Apply")}
            </span>
          </div>
          <div className="auth-content-enter mb-8">
            <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.2em] text-brand-innovation">
              {t(isRegister ? "Start your journey" : "Welcome back")}
            </p>
            <h2 className="text-3xl font-extrabold tracking-tight text-brand-dark sm:text-4xl">
              {t(isRegister ? "Create your account" : "Good to see you again.")}
            </h2>
            <p className="mt-3 leading-relaxed text-gray-500">
              {isRegister
                ? t("Join PathMe and start building skills for what’s next.")
                : t("Log in to pick up where your learning journey left off.")}
            </p>
          </div>

          <form
            className="auth-content-enter auth-content-delay space-y-5"
            onSubmit={handleSubmit}
            noValidate
          >
            {isRegister && (
              <div>
                <label
                  htmlFor="username"
                  className="mb-2 block text-sm font-bold text-brand-dark"
                >
                  {t("Username")}
                </label>
                <div className="relative">
                  <i
                    className="fa-regular fa-user pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    aria-hidden="true"
                  />
                  <input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    autoCapitalize="none"
                    spellCheck={false}
                    placeholder={t("Choose a username")}
                    aria-invalid={Boolean(fieldErrors.username)}
                    className={`w-full rounded-xl border bg-gray-50 py-3.5 pl-11 pr-4 text-sm text-brand-dark outline-none transition placeholder:text-gray-400 focus:bg-white focus:ring-4 ${fieldBorder("username")}`}
                  />
                </div>
                <p className="mt-1.5 text-xs text-gray-400">
                  {t("Use letters and numbers; don’t include spaces.")}
                </p>
                {renderFieldError("username")}
              </div>
            )}
            <div>
              <label
                htmlFor={isRegister ? "email" : "login-username"}
                className="mb-2 block text-sm font-bold text-brand-dark"
              >
                {t(isRegister ? "Email address" : "Username")}
              </label>
              <div className="relative">
                <i
                  className={`fa-regular ${isRegister ? "fa-envelope" : "fa-user"} pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400`}
                  aria-hidden="true"
                />
                <input
                  id={isRegister ? "email" : "login-username"}
                  name={isRegister ? "email" : "username"}
                  type={isRegister ? "email" : "text"}
                  autoComplete={isRegister ? "email" : "username"}
                  autoCapitalize={isRegister ? undefined : "none"}
                  spellCheck={isRegister ? undefined : false}
                  placeholder={
                    isRegister ? "you@example.com" : t("Enter your username")
                  }
                  aria-invalid={Boolean(
                    fieldErrors[isRegister ? "email" : "username"],
                  )}
                  className={`w-full rounded-xl border bg-gray-50 py-3.5 pl-11 pr-4 text-sm text-brand-dark outline-none transition placeholder:text-gray-400 focus:bg-white focus:ring-4 ${fieldBorder(isRegister ? "email" : "username")}`}
                />
              </div>
              {renderFieldError(isRegister ? "email" : "username")}
            </div>
            {isRegister && (
              <div>
                <label
                  htmlFor="phoneNumber"
                  className="mb-2 block text-sm font-bold text-brand-dark"
                >
                  {t("Phone number")}
                </label>
                <div className="relative">
                  <i
                    className="fa-solid fa-phone pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    aria-hidden="true"
                  />
                  <div className="flex gap-2">
                    <label htmlFor="phone-country-code" className="sr-only">
                      {t("Country calling code")}
                    </label>
                    <div className="relative w-[42%] min-w-32">
                      {phoneCountries.find(
                        (country) => country.iso2 === selectedPhoneIso2,
                      )?.flag && (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={
                            phoneCountries.find(
                              (country) => country.iso2 === selectedPhoneIso2,
                            ).flag
                          }
                          alt=""
                          aria-hidden="true"
                          className="pointer-events-none absolute left-3 top-1/2 h-4 w-5 -translate-y-1/2 rounded-sm object-cover"
                        />
                      )}
                      <select
                        id="phone-country-code"
                        value={selectedPhoneIso2}
                        onChange={(event) =>
                          setSelectedPhoneIso2(event.target.value)
                        }
                        disabled={
                          phoneCountriesLoading ||
                          phoneCountriesError ||
                          isSubmitting
                        }
                        aria-label={t("Country calling code")}
                        aria-invalid={Boolean(fieldErrors.phoneNumber)}
                        className={`w-full appearance-none rounded-xl border bg-gray-50 py-3.5 pl-10 pr-7 text-sm text-brand-dark outline-none transition focus:bg-white focus:ring-4 disabled:cursor-wait disabled:opacity-60 ${fieldBorder("phoneNumber")}`}
                      >
                        {phoneCountries.map((country) => (
                          <option
                            key={`${country.iso2}-${country.code}`}
                            value={country.iso2}
                          >
                            {country.name} ({country.code})
                          </option>
                        ))}
                      </select>
                      <i
                        className="fa-solid fa-chevron-down pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-gray-400"
                        aria-hidden="true"
                      />
                    </div>
                    <input
                      id="phoneNumber"
                      name="phoneNumber"
                      type="tel"
                      autoComplete="tel-national"
                      inputMode="tel"
                      required
                      placeholder={t("Phone number")}
                      aria-invalid={Boolean(fieldErrors.phoneNumber)}
                      className={`min-w-0 flex-1 rounded-xl border bg-gray-50 py-3.5 pl-3.5 pr-3 text-sm text-brand-dark outline-none transition placeholder:text-gray-400 focus:bg-white focus:ring-4 ${fieldBorder("phoneNumber")}`}
                    />
                  </div>
                </div>
                {phoneCountriesLoading && (
                  <p className="mt-1.5 text-xs text-gray-400" role="status">
                    {t("Loading country calling codes…")}
                  </p>
                )}
                {phoneCountriesError && (
                  <div
                    className="mt-1.5 flex items-center justify-between gap-2 text-xs text-red-600"
                    role="alert"
                  >
                    <span>{phoneCountriesError}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setPhoneCountriesLoading(true);
                        setPhoneCountriesError("");
                        setPhoneCountriesRetry((retry) => retry + 1);
                      }}
                      className="shrink-0 font-bold underline underline-offset-2"
                    >
                      {t("Retry")}
                    </button>
                  </div>
                )}
                {renderFieldError("phoneNumber")}
              </div>
            )}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="text-sm font-bold text-brand-dark"
                >
                  {t("Password")}
                </label>
                {!isRegister && (
                  <button
                    type="button"
                    onClick={() => setForgotPasswordOpen(true)}
                    className="text-xs font-bold text-brand-primary transition duration-200 hover:text-brand-innovation"
                  >
                    {t("Forgot password?")}
                  </button>
                )}
              </div>
              <div className="relative">
                <i
                  className="fa-solid fa-lock pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  aria-hidden="true"
                />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete={
                    isRegister ? "new-password" : "current-password"
                  }
                  placeholder={
                    isRegister
                      ? t("At least 8 characters")
                      : t("Enter your password")
                  }
                  aria-invalid={Boolean(fieldErrors.password)}
                  className={`w-full rounded-xl border bg-gray-50 py-3.5 pl-11 pr-12 text-sm text-brand-dark outline-none transition placeholder:text-gray-400 focus:bg-white focus:ring-4 ${fieldBorder("password")}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={t(showPassword ? "Hide password" : "Show password")}
                  className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-brand-primary"
                >
                  <i
                    className={`fa-regular ${showPassword ? "fa-eye-slash" : "fa-eye"}`}
                    aria-hidden="true"
                  />
                </button>
              </div>
              {renderFieldError("password")}
            </div>
            {isRegister && (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="role"
                      className="mb-2 block text-sm font-bold text-brand-dark"
                    >
                      {t("I am a")}
                    </label>
                    <select
                      id="role"
                      name="role"
                      defaultValue=""
                      aria-invalid={Boolean(fieldErrors.role)}
                      className={`w-full rounded-xl border bg-gray-50 px-4 py-3.5 text-sm text-brand-dark outline-none transition focus:bg-white focus:ring-4 ${fieldBorder("role")}`}
                    >
                      <option value="" disabled>
                        {t("Select role")}
                      </option>
                      <option value="parent">{t("Parent")}</option>
                      <option value="student">{t("Student")}</option>
                    </select>
                    {renderFieldError("role")}
                  </div>
                  <div>
                    <label
                      htmlFor="gender"
                      className="mb-2 block text-sm font-bold text-brand-dark"
                    >
                      {t("Gender")}
                    </label>
                    <select
                      id="gender"
                      name="gender"
                      defaultValue=""
                      aria-invalid={Boolean(fieldErrors.gender)}
                      className={`w-full rounded-xl border bg-gray-50 px-4 py-3.5 text-sm text-brand-dark outline-none transition focus:bg-white focus:ring-4 ${fieldBorder("gender")}`}
                    >
                      <option value="">{t("Select gender")}</option>
                      <option value="female">{t("Female")}</option>
                      <option value="male">{t("Male")}</option>
                      <option value="prefer-not-to-say">
                        {t("Prefer not to say")}
                      </option>
                    </select>
                    {renderFieldError("gender")}
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="age"
                    className="mb-2 block text-sm font-bold text-brand-dark"
                  >
                    {t("Age")}
                  </label>
                  <input
                    id="age"
                    name="age"
                    type="number"
                    inputMode="numeric"
                    placeholder={t("Enter your age")}
                    aria-invalid={Boolean(fieldErrors.age)}
                    className={`w-full rounded-xl border bg-gray-50 px-4 py-3.5 text-sm text-brand-dark outline-none transition placeholder:text-gray-400 focus:bg-white focus:ring-4 ${fieldBorder("age")}`}
                  />
                  {renderFieldError("age")}
                </div>
                <label className="flex items-start gap-3 text-xs leading-relaxed text-gray-500">
                  <input
                    name="terms"
                    type="checkbox"
                    className="mt-0.5 h-4 w-4 shrink-0 accent-brand-primary"
                  />
                  <span>
                    {t("I agree to the")}{" "}
                    <span className="font-bold text-brand-primary">
                      {t("Terms of service")}
                    </span>{" "}
                    and{" "}
                    <span className="font-bold text-brand-primary">
                      {t("Privacy policy")}
                    </span>
                    .
                  </span>
                </label>
              </>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-primary px-5 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-brand-primary/20 transition hover:-translate-y-0.5 hover:bg-[#1c3073] focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-primary/20"
            >
              {isSubmitting
                ? t("Please wait…")
                : isRegister
                  ? t("Create account")
                  : t("Log in")}
              {!isSubmitting && (
                <i
                  className="fa-solid fa-arrow-right text-xs"
                  aria-hidden="true"
                />
              )}
            </button>
            <div className="flex items-center gap-3" aria-hidden="true">
              <span className="h-px flex-1 bg-gray-200" />
              <span className="text-xs font-semibold text-gray-400">{t("OR")}</span>
              <span className="h-px flex-1 bg-gray-200" />
            </div>
            {googleClientId ? (
              isRegister ? (
                <button
                  type="button"
                  onClick={() => {
                    setGoogleError("");
                    setGoogleRoleModalOpen(true);
                  }}
                  className="flex w-full items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white px-5 py-3.5 text-sm font-bold text-brand-dark transition hover:bg-gray-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-primary/10"
                >
                  <GoogleMark />
                  {t("Sign up with Google")}
                </button>
              ) : (
                <div className="flex justify-center">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    theme="outline"
                    size="large"
                    text="signin_with"
                    shape="rectangular"
                    width={320}
                    useOneTap={false}
                  />
                </div>
              )
            ) : (
              <p className="text-center text-xs text-amber-700">
                {t("Google sign-in needs NEXT_PUBLIC_GOOGLE_CLIENT_ID configured.")}
              </p>
            )}
            {!isRegister && googleError && (
              <p role="alert" className="text-center text-sm text-red-600">
                {googleError}
              </p>
            )}
          </form>

          <p className="auth-content-enter auth-content-delay-late mt-5 text-center text-sm text-gray-500">
            {t(isRegister ? "Already have an account?" : "New to PathMe?")}{" "}
            <Link
              href={isRegister ? "/login" : "/register"}
              className="font-extrabold text-brand-primary transition hover:text-brand-innovation"
            >
              {t(isRegister ? "Log in" : "Create an account")}
            </Link>
          </p>
          <div className="auth-content-enter auth-content-delay-late mt-8 flex items-center justify-center gap-2 border-t border-gray-100 pt-6 text-xs text-gray-400">
            <i
              className="fa-solid fa-shield-halved text-brand-innovation"
              aria-hidden="true"
            />
            {t("Your learning journey starts here")}
          </div>
        </div>
      </div>

      {!isRegister && (
        <ForgotPasswordModal
          open={forgotPasswordOpen}
          onClose={() => setForgotPasswordOpen(false)}
        />
      )}

      {isRegister && (
        <Modal
          open={googleRoleModalOpen}
          onClose={() => {
            setGoogleRoleModalOpen(false);
            setGoogleRoleConfirmed(false);
            setGoogleError("");
          }}
          title={t("Choose your account role")}
          maxWidth="max-w-md"
        >
          <div className="space-y-5">
            <div className="text-center">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-light text-brand-primary">
                <i className="fa-solid fa-user-tag" aria-hidden="true" />
              </span>
              <h2 className="mt-4 text-xl font-extrabold text-brand-dark">
                {t("Choose your role")}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-gray-500">
                {t("Select how you’ll use PathMe before continuing with Google.")}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {["PARENT", "STUDENT"].map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => {
                    setGoogleRole(role);
                    setGoogleRoleConfirmed(false);
                    setGoogleError("");
                  }}
                  aria-pressed={googleRole === role}
                  className={`rounded-xl border px-4 py-4 text-sm font-bold transition ${
                    googleRole === role
                      ? "border-brand-primary bg-brand-light text-brand-primary ring-2 ring-brand-primary/10"
                      : "border-gray-200 bg-white text-gray-600 hover:border-brand-innovation"
                  }`}
                >
                  <i
                    className={`fa-solid ${role === "PARENT" ? "fa-people-roof" : "fa-user-graduate"} mb-2 block text-lg`}
                    aria-hidden="true"
                  />
                  {t(role === "PARENT" ? "Parent" : "Student")}
                </button>
              ))}
            </div>

            {!googleRoleConfirmed ? (
              <button
                type="button"
                disabled={!googleRole}
                onClick={() => setGoogleRoleConfirmed(true)}
                className="w-full rounded-xl bg-brand-primary px-5 py-3.5 text-sm font-extrabold text-white transition hover:bg-[#1c3073] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {t("Continue to Google")}
              </button>
            ) : (
              <div className="flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  theme="outline"
                  size="large"
                  text="signup_with"
                  shape="rectangular"
                  width={320}
                  useOneTap={false}
                />
              </div>
            )}

            {googleError && (
              <p role="alert" className="text-center text-sm text-red-600">
                {googleError}
              </p>
            )}
          </div>
        </Modal>
      )}
    </section>
  );
}

function GoogleMark() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.76 7.18l7.73 6C44.42 37.95 46.98 31.89 46.98 24.55Z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.91-5.8l-7.73-6c-2.14 1.44-4.89 2.3-8.18 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59a14.4 14.4 0 0 1 0-9.18l-7.98-6.19a23.9 23.9 0 0 0 0 21.56l7.98-6.19Z"
      />
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z"
      />
    </svg>
  );
}
