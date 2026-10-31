"use client";

import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { FooterCategories } from "./FooterCategories";
import { useLanguage } from "@/lib/language";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/courses", label: "Course Catalog" },
  { href: "/about", label: "About PathMe" },
];

const SOCIALS = [
  { icon: "fa-facebook-f", label: "Facebook" },
  { icon: "fa-x-twitter", label: "X" },
  { icon: "fa-instagram", label: "Instagram" },
  { icon: "fa-discord", label: "Discord" },
];

export function SiteFooter() {
  const { t } = useLanguage();

  return (
    <footer className="relative mt-20 overflow-hidden border-t border-white/10 bg-brand-dark text-white">
      <div
        className="pointer-events-none absolute -right-28 -top-36 h-96 w-96 rounded-full bg-brand-primary/30 blur-3xl"
        aria-hidden="true"
      />
      <div className="relative mx-auto max-w-7xl space-y-10 px-4 pb-8 pt-12 sm:px-6 sm:pt-16 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_0.8fr_1fr] lg:gap-14">
          <div className="space-y-5">
            <Logo variant="dark" size="sm" />
            <p className="max-w-sm text-sm leading-7 text-slate-300">
              {t("Practical learning pathways that help students explore technology, build real projects, and grow future-ready skills.")}
            </p>
            <div className="flex gap-2.5 pt-1">
              {SOCIALS.map(({ icon, label }) => (
                <a
                  key={icon}
                  href="#"
                  aria-label={label}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 transition duration-200 hover:-translate-y-0.5 hover:border-brand-innovation/50 hover:bg-brand-innovation hover:text-white"
                >
                  <i className={`fa-brands ${icon} text-sm`} aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          <FooterColumn title={t("Navigation")} links={NAV_LINKS} t={t} />
          <FooterCategories />
        </div>

        <div className="flex flex-col gap-5 border-t border-white/10 pt-6 text-center text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <p>
            {t("© 2026 PathMe Inc. All rights reserved. Your Path to Intelligence.")}
          </p>
          <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 sm:justify-end">
            <Link
              href="/privacy-policy"
              className="transition hover:text-white"
            >
              {t("Privacy Policy")}
            </Link>
            <Link
              href="/terms-of-service"
              className="transition hover:text-white"
            >
              {t("Terms of Service")}
            </Link>
            <Link
              href="/student-guidelines"
              className="transition hover:text-white"
            >
              {t("Student Guidelines")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links, t }) {
  return (
    <div>
      <h2 className="text-xs font-extrabold uppercase tracking-[0.18em] text-brand-innovation">
        {title}
      </h2>
      <ul className="mt-4 space-y-3">
        {links.map(({ href, label }) => (
          <li key={label}>
            <Link
              href={href}
              className="inline-flex text-sm text-slate-300 transition duration-200 hover:translate-x-0.5 hover:text-white"
            >
              {t(label)}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
