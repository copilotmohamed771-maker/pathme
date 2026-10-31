import Link from "next/link";

const POLICY_NAVIGATION = [
  { href: "/terms-of-service", label: "Terms of Service" },
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/student-guidelines", label: "Student Guidelines" },
];

export function PolicyPage({ eyebrow, title, description, icon, sections }) {
  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <header className="policy-hero relative isolate overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand-primary via-[#263d83] to-slate-950 px-6 py-10 text-white shadow-xl sm:px-10 sm:py-14 lg:px-14">
        <div
          className="pointer-events-none absolute -right-16 -top-24 -z-10 h-72 w-72 rounded-full border border-white/10 sm:h-96 sm:w-96"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-24 right-20 -z-10 h-64 w-64 rounded-full bg-brand-innovation/20 blur-3xl"
          aria-hidden="true"
        />
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-2 text-xs font-bold uppercase tracking-[0.16em] text-teal-200 backdrop-blur">
            <i className={`fa-solid ${icon}`} aria-hidden="true" />
            {eyebrow}
          </span>
          <h1 className="mt-5 text-4xl font-extrabold tracking-tight sm:text-5xl">
            {title}
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-blue-100 sm:text-base">
            {description}
          </p>
          <p className="mt-5 text-xs font-medium text-blue-200">
            Updated October 24, 2026
          </p>
        </div>
        <div
          className="absolute bottom-10 right-12 hidden h-28 w-28 items-center justify-center rounded-3xl border border-white/15 bg-white/5 text-4xl text-white/80 backdrop-blur-sm lg:flex"
          aria-hidden="true"
        >
          <i className={`fa-solid ${icon}`} />
        </div>
      </header>

      <div className="grid items-start gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
        <nav
          aria-label="Policy pages"
          className="policy-nav-enter rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm lg:sticky lg:top-24"
        >
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-slate-400">
            PathMe policies
          </p>
          <ul className="mt-3 space-y-1">
            {POLICY_NAVIGATION.map((item) => {
              const current = item.label === title;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={current ? "page" : undefined}
                    className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-bold transition duration-200 ${
                      current
                        ? "bg-brand-primary/8 text-brand-primary"
                        : "text-slate-600 hover:bg-slate-50 hover:text-brand-primary"
                    }`}
                  >
                    {item.label}
                    {current && (
                      <i
                        className="fa-solid fa-arrow-right text-xs"
                        aria-hidden="true"
                      />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <main className="space-y-4">
          {sections.map(({ id, heading, paragraphs, bullets }, index) => (
            <section
              key={id}
              id={id}
              className="policy-section scroll-mt-24 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition duration-300 hover:border-brand-primary/15 hover:shadow-md sm:p-7"
              style={{ "--policy-order": index }}
              aria-labelledby={`${id}-heading`}
            >
              <h2
                id={`${id}-heading`}
                className="text-lg font-extrabold tracking-tight text-brand-dark sm:text-xl"
              >
                {heading}
              </h2>
              {paragraphs?.map((paragraph) => (
                <p
                  key={paragraph}
                  className="mt-3 text-sm leading-7 text-slate-600"
                >
                  {paragraph}
                </p>
              ))}
              {bullets && (
                <ul className="mt-4 space-y-2.5">
                  {bullets.map((bullet) => (
                    <li
                      key={bullet}
                      className="flex gap-3 text-sm leading-6 text-slate-600"
                    >
                      <i
                        className="fa-solid fa-check mt-1 text-xs text-brand-innovation"
                        aria-hidden="true"
                      />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}

        </main>
      </div>
    </div>
  );
}
