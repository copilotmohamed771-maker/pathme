"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Modal } from "@/components/ui/Modal";
import {
  apiRequest,
  clearAuthSession,
  getAuthUser,
  updateAuthUser,
} from "@/lib/api";

export default function ProfilePageClient() {
  const router = useRouter();
  const [request, setRequest] = useState({
    status: "loading",
    profile: null,
    error: "",
  });
  const [retryKey, setRetryKey] = useState(0);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [form, setForm] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState(null);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordFeedback, setPasswordFeedback] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    apiRequest("/users/me", { signal: controller.signal })
      .then((profile) => {
        if (!profile || typeof profile !== "object" || !profile.username) {
          throw new Error("The profile API returned an unexpected response.");
        }
        setRequest({ status: "success", profile, error: "" });
        setForm(toProfileForm(profile));
        updateAuthUser(profile);
      })
      .catch((error) => {
        if (controller.signal.aborted) return;
        if (error.status === 401 || error.status === 403) {
          const savedUser = getAuthUser();
          if (savedUser?.username) {
            setRequest({ status: "success", profile: savedUser, error: "" });
            setForm(toProfileForm(savedUser));
            return;
          }
          router.replace(`/login?next=${encodeURIComponent("/profile")}`);
          return;
        }
        setRequest({ status: "error", profile: null, error: error.message });
      });

    return () => controller.abort();
  }, [retryKey, router]);

  if (request.status === "loading") {
    return (
      <div
        className="mx-auto max-w-4xl animate-pulse px-4 py-12 sm:px-6 lg:px-8"
        role="status"
        aria-label="Loading profile"
      >
        <div className="h-8 w-48 rounded bg-gray-200" />
        <div className="mt-6 h-64 rounded-3xl bg-gray-200" />
      </div>
    );
  }

  if (request.status === "error") {
    return (
      <section className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <h1 className="text-2xl font-extrabold text-brand-dark">
          Could not load your profile
        </h1>
        <p className="mt-2 text-sm text-slate-600" role="alert">
          {request.error}
        </p>
        <button
          type="button"
          onClick={() => {
            setRequest({ status: "loading", profile: null, error: "" });
            setRetryKey((key) => key + 1);
          }}
          className="mt-5 rounded-xl bg-brand-primary px-6 py-3 text-sm font-bold text-white transition hover:bg-[#1c3073]"
        >
          Try again
        </button>
      </section>
    );
  }

  const { profile } = request;
  const initial = (profile.firstName || profile.username)
    .trim()[0]
    .toUpperCase();
  const createdDate = profile.createdAt
    ? new Intl.DateTimeFormat(undefined, {
        dateStyle: "long",
      }).format(new Date(profile.createdAt))
    : "Not provided";

  function changeField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function cancelEditing() {
    setForm(toProfileForm(profile));
    setIsEditing(false);
    setSaveFeedback(null);
  }

  async function handleSave(event) {
    event.preventDefault();
    if (isSaving) return;

    const payload = {
      username: form.username.trim(),
      email: form.email.trim(),
      phoneNumber: form.phoneNumber.trim(),
      gender: form.gender.toUpperCase(),
      age: form.age === "" ? null : Number(form.age),
    };

    if (!payload.username || !payload.email) {
      setSaveFeedback({
        type: "error",
        message: "Username and email are required.",
      });
      return;
    }

    if (
      payload.age !== null &&
      (!Number.isInteger(payload.age) || payload.age < 1)
    ) {
      setSaveFeedback({ type: "error", message: "Enter a valid age." });
      return;
    }

    setIsSaving(true);
    setSaveFeedback(null);
    try {
      const result = await apiRequest("/users/me", {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
      const updatedProfile = result?.user || result?.profile || result;
      const nextProfile = {
        ...profile,
        ...(updatedProfile && typeof updatedProfile === "object"
          ? updatedProfile
          : {}),
        ...payload,
      };

      setRequest({ status: "success", profile: nextProfile, error: "" });
      setForm(toProfileForm(nextProfile));
      setIsEditing(false);
      updateAuthUser(nextProfile);
      setSaveFeedback({
        type: "success",
        message: "Your profile was updated.",
      });
    } catch (error) {
      setSaveFeedback({
        type: "error",
        message:
          error.message || "Could not save your profile. Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleLogout() {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    setLogoutError("");

    try {
      await apiRequest("/auth/logout", { method: "POST" });
      clearAuthSession();
      router.replace("/");
      router.refresh();
    } catch (error) {
      setLogoutError(error.message || "Could not log out. Please try again.");
      setIsLoggingOut(false);
    }
  }

  async function handleDeleteAccount() {
    if (isDeleting) return;

    setIsDeleting(true);
    setDeleteError("");
    try {
      await apiRequest("/users/me", { method: "DELETE" });
      clearAuthSession();
      setIsDeleteModalOpen(false);
      router.replace("/");
      router.refresh();
    } catch (error) {
      setDeleteError(
        error.message || "Could not delete your account. Please try again.",
      );
      setIsDeleting(false);
    }
  }

  async function handleChangePassword(event) {
    event.preventDefault();
    if (isChangingPassword) return;

    if (passwordForm.newPassword.length < 8) {
      setPasswordFeedback({
        type: "error",
        message: "Your new password must be at least 8 characters.",
      });
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordFeedback({
        type: "error",
        message: "The new passwords do not match.",
      });
      return;
    }
    if (passwordForm.currentPassword === passwordForm.newPassword) {
      setPasswordFeedback({
        type: "error",
        message: "Choose a new password that differs from your current one.",
      });
      return;
    }

    setIsChangingPassword(true);
    setPasswordFeedback(null);
    try {
      await apiRequest("/auth/change-password", {
        method: "PATCH",
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setPasswordFeedback({
        type: "success",
        message: "Your password has been changed.",
      });
    } catch (error) {
      setPasswordFeedback({
        type: "error",
        message: error.message || "Could not change your password.",
      });
    } finally {
      setIsChangingPassword(false);
    }
  }

  return (
    <main className="course-detail-enter mx-auto max-w-5xl space-y-7 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <header className="relative flex flex-col gap-6 overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_18px_50px_-36px_rgba(16,24,47,0.45)] sm:flex-row sm:items-center sm:justify-between sm:p-9">
        <div
          className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-emerald-600 via-teal-500 to-sky-500"
          aria-hidden="true"
        />
        <div>
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-800">
            <Image
              src="/images/pathme-mark.png"
              alt=""
              aria-hidden="true"
              width={325}
              height={400}
              className="h-7 w-6 object-contain"
            />
            Account center
          </p>
          <div className="mt-4 flex items-center gap-4 sm:gap-6">
            <div
              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-4 border-emerald-50 bg-emerald-700 text-2xl font-extrabold text-white shadow-sm sm:h-20 sm:w-20 sm:text-3xl"
              aria-hidden="true"
            >
              {initial}
            </div>
            <div className="min-w-0">
              <h1 className="wrap-break-word text-2xl font-extrabold text-brand-dark sm:text-3xl">
                {profile.username}
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                Manage your account details
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:w-auto sm:items-end">
          {logoutError && (
            <p className="text-sm text-red-700" role="alert">
              {logoutError}
            </p>
          )}
          <div className="flex flex-col gap-2 sm:flex-row">
            {isEditing ? (
              <>
                <button
                  type="button"
                  onClick={cancelEditing}
                  disabled={isSaving}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="profile-edit-form"
                  disabled={isSaving}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-brand-primary px-4 text-sm font-bold text-white transition hover:bg-[#1c3073] disabled:cursor-wait disabled:opacity-60"
                >
                  <i
                    className={`fa-solid ${isSaving ? "fa-spinner fa-spin" : "fa-floppy-disk"}`}
                    aria-hidden="true"
                  />
                  {isSaving ? "Saving..." : "Save changes"}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setForm(toProfileForm(profile));
                  setSaveFeedback(null);
                  setIsEditing(true);
                }}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-brand-primary px-4 text-sm font-bold text-white transition hover:bg-[#1c3073] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
              >
                <i className="fa-solid fa-pen-to-square" aria-hidden="true" />
                Edit profile
              </button>
            )}
            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut || isSaving || isDeleting}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 text-sm font-bold text-red-700 transition hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 disabled:cursor-wait disabled:opacity-60"
            >
              <i
                className={`fa-solid ${isLoggingOut ? "fa-spinner fa-spin" : "fa-arrow-right-from-bracket"}`}
                aria-hidden="true"
              />
              {isLoggingOut ? "Logging out..." : "Log out"}
            </button>
          </div>
        </div>
      </header>

      {saveFeedback && (
        <p
          className={`rounded-xl border px-4 py-3 text-sm ${saveFeedback.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-red-200 bg-red-50 text-red-800"}`}
          role={saveFeedback.type === "error" ? "alert" : "status"}
        >
          {saveFeedback.message}
        </p>
      )}

      <section className="course-detail-section rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_14px_45px_-32px_rgba(16,24,47,0.35)] sm:p-8">
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-slate-100 pb-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-700">
              Personal information
            </p>
            <h2 className="mt-1 text-xl font-extrabold text-brand-dark">
              Account details
            </h2>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            {isEditing
              ? "Changes are saved to your account"
              : "Your account at a glance"}
          </span>
        </div>

        <form id="profile-edit-form" onSubmit={handleSave} className="pt-6">
          <div className="grid gap-5 sm:grid-cols-2">
            <ProfileField
              id="profile-username"
              name="username"
              label="Username"
              value={form.username}
              onChange={changeField}
              editing={isEditing}
              disabled={isSaving}
              autoComplete="username"
              required
            />
            <ProfileField
              id="profile-email"
              name="email"
              label="Email address"
              type="email"
              value={form.email}
              onChange={changeField}
              editing={isEditing}
              disabled={isSaving}
              autoComplete="email"
              required
            />
            <ProfileField
              id="profile-phone"
              name="phoneNumber"
              label="Phone number"
              type="tel"
              value={form.phoneNumber}
              onChange={changeField}
              editing={isEditing}
              disabled={isSaving}
              autoComplete="tel"
            />
            {isEditing ? (
              <label
                className="grid gap-2 text-sm font-semibold text-slate-700"
                htmlFor="profile-gender"
              >
                Gender
                <select
                  id="profile-gender"
                  name="gender"
                  value={form.gender}
                  onChange={changeField}
                  disabled={isSaving}
                  className="min-h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm text-brand-dark outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10 disabled:bg-slate-50"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </label>
            ) : (
              <ProfileValue label="Gender" value={profile.gender} />
            )}
            {isEditing ? (
              <ProfileField
                id="profile-age"
                name="age"
                label="Age"
                type="number"
                min="1"
                step="1"
                value={form.age}
                onChange={changeField}
                editing={isEditing}
                disabled={isSaving}
                inputMode="numeric"
              />
            ) : (
              <ProfileValue label="Age" value={profile.age} />
            )}
            <ProfileValue label="Account type" value={profile.role} />
            <ProfileValue label="Member since" value={createdDate} />
          </div>

          {isEditing && (
            <div className="mt-6 flex items-center gap-2 border-t border-slate-100 pt-5 text-xs text-slate-500">
              <i
                className="fa-solid fa-lock text-emerald-700"
                aria-hidden="true"
              />
              Your account type and membership date can’t be changed here.
            </div>
          )}
        </form>
      </section>

      <section className="course-detail-section rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_14px_45px_-32px_rgba(16,24,47,0.35)] sm:p-8">
        <div className="border-b border-slate-100 pb-5">
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-700">
            Account security
          </p>
          <h2 className="mt-1 text-xl font-extrabold text-brand-dark">
            Change password
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Confirm your current password before choosing a new one.
          </p>
        </div>

        {passwordFeedback && (
          <p
            className={`mt-5 rounded-xl border px-4 py-3 text-sm ${passwordFeedback.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-red-200 bg-red-50 text-red-800"}`}
            role={passwordFeedback.type === "error" ? "alert" : "status"}
          >
            {passwordFeedback.message}
          </p>
        )}

        <form onSubmit={handleChangePassword} className="mt-5 space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <PasswordField
              id="current-password"
              name="currentPassword"
              label="Current password"
              value={passwordForm.currentPassword}
              onChange={(event) =>
                setPasswordForm((current) => ({
                  ...current,
                  currentPassword: event.target.value,
                }))
              }
              autoComplete="current-password"
              disabled={isChangingPassword}
              required
            />
            <div className="hidden sm:block" aria-hidden="true" />
            <PasswordField
              id="new-password"
              name="newPassword"
              label="New password"
              value={passwordForm.newPassword}
              onChange={(event) =>
                setPasswordForm((current) => ({
                  ...current,
                  newPassword: event.target.value,
                }))
              }
              autoComplete="new-password"
              minLength={8}
              disabled={isChangingPassword}
              required
            />
            <PasswordField
              id="confirm-password"
              name="confirmPassword"
              label="Confirm new password"
              value={passwordForm.confirmPassword}
              onChange={(event) =>
                setPasswordForm((current) => ({
                  ...current,
                  confirmPassword: event.target.value,
                }))
              }
              autoComplete="new-password"
              minLength={8}
              disabled={isChangingPassword}
              required
            />
          </div>
          <button
            type="submit"
            disabled={isChangingPassword}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-brand-primary px-4 text-sm font-bold text-white transition hover:bg-[#1c3073] disabled:cursor-wait disabled:opacity-60"
          >
            <i
              className={`fa-solid ${isChangingPassword ? "fa-spinner fa-spin" : "fa-key"}`}
              aria-hidden="true"
            />
            {isChangingPassword ? "Updating password..." : "Update password"}
          </button>
        </form>
      </section>

      <section className="rounded-3xl border border-red-200 bg-red-50/50 p-6 sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-widest text-red-700">
              Danger zone
            </p>
            <h2 className="mt-1 text-lg font-extrabold text-brand-dark">
              Delete account
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Permanently remove your PathMe account and profile data. This
              action cannot be undone.
            </p>
            {deleteError && (
              <p
                className="mt-3 text-sm font-semibold text-red-700"
                role="alert"
              >
                {deleteError}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => {
              setDeleteError("");
              setIsDeleteModalOpen(true);
            }}
            disabled={isDeleting || isSaving || isLoggingOut}
            className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-red-300 bg-white px-4 text-sm font-bold text-red-700 transition hover:bg-red-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 disabled:cursor-wait disabled:opacity-60"
          >
            <i
              className={`fa-solid ${isDeleting ? "fa-spinner fa-spin" : "fa-trash-can"}`}
              aria-hidden="true"
            />
            {isDeleting ? "Deleting account..." : "Delete account"}
          </button>
        </div>
      </section>

      <Modal
        open={isDeleteModalOpen}
        onClose={() => {
          if (!isDeleting) setIsDeleteModalOpen(false);
        }}
        title="Confirm account deletion"
        maxWidth="max-w-md"
        padding="p-0"
      >
        <div className="p-6 sm:p-7">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-700">
            <i className="fa-solid fa-trash-can" aria-hidden="true" />
          </div>
          <h2 className="mt-4 text-xl font-extrabold text-brand-dark">
            Delete your account?
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            Your account and profile data will be permanently removed. You
            cannot undo this action.
          </p>
          {deleteError && (
            <p
              className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
              role="alert"
            >
              {deleteError}
            </p>
          )}
          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={isDeleting}
              className="min-h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
            >
              Keep account
            </button>
            <button
              type="button"
              onClick={handleDeleteAccount}
              disabled={isDeleting}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-red-700 px-4 text-sm font-bold text-white transition hover:bg-red-800 disabled:cursor-wait disabled:opacity-60"
            >
              <i
                className={`fa-solid ${isDeleting ? "fa-spinner fa-spin" : "fa-trash-can"}`}
                aria-hidden="true"
              />
              {isDeleting ? "Deleting account..." : "Delete permanently"}
            </button>
          </div>
        </div>
      </Modal>
    </main>
  );
}

function PasswordField({ id, name, label, value, onChange, ...inputProps }) {
  return (
    <label
      className="grid gap-2 text-sm font-semibold text-slate-700"
      htmlFor={id}
    >
      {label}
      <input
        {...inputProps}
        id={id}
        name={name}
        type="password"
        value={value}
        onChange={onChange}
        className="min-h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm text-brand-dark outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10 disabled:bg-slate-50"
      />
    </label>
  );
}

function toProfileForm(profile) {
  return {
    username: profile.username || "",
    email: profile.email || "",
    phoneNumber: profile.phoneNumber || "",
    gender: (profile.gender || "").toLowerCase(),
    age: profile.age == null ? "" : String(profile.age),
  };
}

function ProfileField({
  id,
  name,
  label,
  type = "text",
  value,
  onChange,
  editing,
  disabled,
  ...inputProps
}) {
  return (
    <label
      className="grid gap-2 text-sm font-semibold text-slate-700"
      htmlFor={id}
    >
      {label}
      {editing ? (
        <input
          {...inputProps}
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className="min-h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm text-brand-dark outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10 disabled:bg-slate-50"
        />
      ) : (
        <span className="flex min-h-12 items-center rounded-xl bg-slate-50 px-4 text-sm font-bold text-brand-dark">
          {value || "Not provided"}
        </span>
      )}
    </label>
  );
}

function ProfileValue({ label, value }) {
  return (
    <div className="grid gap-2 text-sm font-semibold text-slate-700">
      <span>{label}</span>
      <span className="flex min-h-12 items-center rounded-xl bg-slate-50 px-4 text-sm font-bold text-brand-dark">
        {value || "Not provided"}
      </span>
    </div>
  );
}
