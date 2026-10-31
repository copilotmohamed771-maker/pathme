"use client";

import { useLanguage } from "@/lib/language";

const PILLARS = [
  {
    icon: "fa-brain",
    title: "AI & ML Focused",
    text: "From foundation theory to real-world impact projects.",
    tint: "bg-brand-primary/10 text-brand-primary group-hover:bg-brand-primary",
  },
  {
    icon: "fa-code",
    title: "Practical Learning",
    text: "Build interactive applications and real projects, not just lecture notes.",
    tint: "bg-brand-innovation/10 text-brand-innovation group-hover:bg-brand-innovation",
  },
  {
    icon: "fa-users-rays",
    title: "Student Community",
    text: "Collaborate with peers, share ideas, and grow together faster.",
    tint: "bg-brand-energy/10 text-brand-energy group-hover:bg-brand-energy",
  },
  {
    icon: "fa-bullseye",
    title: "Future Ready",
    text: "Master high-demand skills for high school, college, and modern careers.",
    tint: "bg-purple-100 text-purple-600 group-hover:bg-purple-600",
  },
];

export function Pillars() {
  const { t } = useLanguage();

  return (
    <section>
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h2 className="text-xs font-bold uppercase tracking-widest text-brand-innovation mb-2">
          {t("Why PathMe?")}
        </h2>
        <p className="text-3xl font-extrabold text-brand-dark">
          {t("Built for Tomorrow’s Innovators")}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {PILLARS.map(({ icon, title, text, tint }) => (
          <div
            key={title}
            className="home-pillar-card bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:-translate-y-1 hover:shadow-md transition text-center group"
          >
            <div
              className={`w-14 h-14 mx-auto mb-4 rounded-2xl flex items-center justify-center text-2xl group-hover:text-white transition-colors duration-300 ${tint}`}
            >
              <i className={`fa-solid ${icon}`} aria-hidden="true" />
            </div>
            <h3 className="text-lg font-bold text-brand-dark mb-2">{t(title)}</h3>
            <p className="text-sm text-gray-600">{t(text)}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
