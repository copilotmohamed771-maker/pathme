"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "@/components/ui/Logo";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import {
  AUTH_SESSION_EVENT,
  clearAuthSession,
  getAuthUser,
  hasAuthSession,
  apiRequest,
} from "@/lib/api";
import { showToast } from "@/lib/toast";
import { useHydrated, useLanguage } from "@/lib/language";

const NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/courses", label: "Courses" },
  { href: "/about", label: "About Us" },
];

export function SiteHeader() {
  const { t } = useLanguage();
  const isHydrated = useHydrated();
  const translate = (text) => (isHydrated ? t(text) : text);
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [profile, setProfile] = useState(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    let requestController;
    let active = true;

    async function loadProfile() {
      requestController?.abort();
      const controller = new AbortController();
      requestController = controller;

      try {
        const result = await apiRequest("/users/me", {
          signal: controller.signal,
        });
        if (active && !controller.signal.aborted) {
          setProfile(result);
          setIsSignedIn(true);
        }
      } catch (error) {
        if (active && !controller.signal.aborted) {
          const savedUser = getAuthUser();
          if (savedUser?.username) {
            setProfile(savedUser);
            setIsSignedIn(true);
          } else if (
            error.status === 401 ||
            error.status === 403 ||
            !hasAuthSession()
          ) {
            setProfile(null);
            setIsSignedIn(false);
          } else {
            setIsSignedIn(true);
          }
        }
      }
    }

    function syncSession() {
      if (!hasAuthSession()) {
        requestController?.abort();
        setProfile(null);
        setIsSignedIn(false);
        return;
      }
      const savedUser = getAuthUser();
      if (savedUser) setProfile(savedUser);
      setIsSignedIn(true);
      loadProfile();
    }

    loadProfile();
    window.addEventListener(AUTH_SESSION_EVENT, syncSession);
    window.addEventListener("pageshow", loadProfile);

    return () => {
      active = false;
      requestController?.abort();
      window.removeEventListener(AUTH_SESSION_EVENT, syncSession);
      window.removeEventListener("pageshow", loadProfile);
    };
  }, []);

  async function handleLogout() {
    if (isLoggingOut) return;
    setIsLoggingOut(true);

    try {
      await apiRequest("/auth/logout", { method: "POST" });
      clearAuthSession();
      setMenuOpen(false);
      router.replace("/");
      router.refresh();
      showToast("Signed out", "You have been securely logged out.");
    } catch (error) {
      showToast("Could not log out", error.message || "Please try again.");
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Logo showTagline />

          <nav
            aria-label={translate("Main")}
            className="hidden md:flex space-x-8 text-sm font-semibold"
          >
            {NAV_ITEMS.map(({ href, label }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`py-2 transition-colors hover:text-brand-innovation ${
                    active
                      ? "text-brand-innovation font-bold border-b-2 border-brand-innovation"
                      : ""
                  }`}
                >
                  {translate(label)}
                </Link>
              );
            })}
          </nav>

          <div className="hidden md:flex items-center space-x-4">
            <LanguageSwitcher />
            {isSignedIn ? (
              <div className="flex items-center gap-2">
                <ProfileAvatar profile={profile} pathname={pathname} />
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-red-100 px-3 text-sm font-bold text-red-600 transition hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500 disabled:cursor-wait disabled:opacity-60"
                >
                  <i
                    className={`fa-solid ${isLoggingOut ? "fa-spinner fa-spin" : "fa-arrow-right-from-bracket"}`}
                    aria-hidden="true"
                  />
                  <span>
                    {translate(isLoggingOut ? "Logging out" : "Log out")}
                  </span>
                </button>
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-3 py-2 text-sm font-bold text-brand-primary transition hover:text-brand-innovation"
                >
                  {translate("Log in")}
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2.5 rounded-xl border border-brand-primary/15 text-brand-primary hover:bg-brand-light font-bold text-sm transition"
                >
                  {translate("Create account")}
                </Link>
              </>
            )}
            <Link
              href="/courses"
              className="px-5 py-2.5 rounded-xl bg-brand-energy hover:bg-amber-500 text-white font-bold text-sm shadow-lg shadow-brand-energy/25 transition-all transform hover:-translate-y-0.5"
            >
              {translate("Explore Courses")}
            </Link>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <LanguageSwitcher />
            {isSignedIn && (
              <ProfileAvatar profile={profile} pathname={pathname} />
            )}
            <button
              type="button"
              aria-label={translate(menuOpen ? "Close menu" : "Open menu")}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              onClick={() => setMenuOpen((open) => !open)}
              className="p-2 rounded-lg text-brand-dark hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
            >
              <i
                className={`fa-solid ${menuOpen ? "fa-xmark" : "fa-bars"} text-xl`}
                aria-hidden="true"
              />
            </button>
          </div>
        </div>
      </div>

      {menuOpen && (
        <div
          id="mobile-menu"
          className="md:hidden bg-white border-b border-gray-200 px-4 pt-2 pb-6 space-y-3 shadow-lg"
        >
          {NAV_ITEMS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              aria-current={pathname === href ? "page" : undefined}
              className={`block w-full text-left py-2 px-3 rounded-lg font-semibold hover:bg-gray-50 ${
                pathname === href ? "text-brand-innovation" : "text-brand-dark"
              }`}
            >
              {translate(label)}
            </Link>
          ))}
          {isSignedIn ? (
            <div className="space-y-2">
              <Link
                href="/profile"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-bold text-brand-dark hover:bg-gray-50"
              >
                <ProfileInitial profile={profile} />
                <span>
                  {profile?.username || translate("Your profile")}
                </span>
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 py-3 text-center font-bold text-red-600 transition hover:border-red-300 hover:bg-red-100 disabled:cursor-wait disabled:opacity-60"
              >
                <i
                  className={`fa-solid ${isLoggingOut ? "fa-spinner fa-spin" : "fa-arrow-right-from-bracket"}`}
                  aria-hidden="true"
                />
                {isLoggingOut
                  ? translate("Logging out")
                  : translate("Log out")}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 pt-2">
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="rounded-xl border border-gray-200 py-3 text-center font-bold text-brand-primary"
              >
                {translate("Log in")}
              </Link>
              <Link
                href="/register"
                onClick={() => setMenuOpen(false)}
                className="rounded-xl bg-brand-primary py-3 text-center font-bold text-white"
              >
                {translate("Sign up")}
              </Link>
            </div>
          )}
          <div className="pt-2">
            <Link
              href="/courses"
              onClick={() => setMenuOpen(false)}
              className="block w-full py-3 rounded-xl bg-brand-energy text-white font-bold text-center shadow-md"
            >
              {translate("Explore Courses")}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

function ProfileAvatar({ profile, pathname }) {
  return (
    <Link
      href="/profile"
      aria-label={`${profile?.username || "Your"} profile`}
      aria-current={pathname === "/profile" ? "page" : undefined}
      title={profile?.username || "Your profile"}
      className={`flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-extrabold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary ${pathname === "/profile" ? "border-emerald-600 bg-emerald-50 text-emerald-800" : "border-emerald-100 bg-emerald-50 text-emerald-800 hover:border-emerald-400"}`}
    >
      <ProfileInitial profile={profile} />
    </Link>
  );
}

function ProfileInitial({ profile }) {
  const name = profile?.firstName || profile?.username || profile?.email || "U";
  return name.trim().charAt(0).toUpperCase();
}
