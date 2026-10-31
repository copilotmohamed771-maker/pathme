export function StatsRow({ courses, totalCourses, coursesLoading }) {
  const active = courses.filter((c) => c.isActive).length;
  const drafts = courses.length - active;

  const label = "text-[10px] font-bold text-slate-400 uppercase tracking-[0.14em]";
  const card =
    "flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:shadow-md";
  const icon = "flex h-11 w-11 items-center justify-center rounded-xl text-base";

  return (
    <section aria-label="Summary" className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className={card}>
        <div>
          <p className={label}>Total Courses</p>
          <p className="text-2xl font-bold text-brand-dark mt-0.5">
            {coursesLoading ? "—" : totalCourses}
          </p>
        </div>
        <div className={`${icon} bg-brand-primary/10 text-brand-primary`}>
          <i className="fa-solid fa-book" aria-hidden="true" />
        </div>
      </div>

      <div className={card}>
        <div>
          <p className={label}>Active vs Drafts (this page)</p>
          <div className="flex items-baseline space-x-2 mt-0.5">
            <span className="text-2xl font-bold text-emerald-600">
              {coursesLoading ? "—" : active}
            </span>
            <span className="text-xs text-gray-400">/</span>
            <span className="text-base font-semibold text-gray-500">
              {coursesLoading ? "—" : drafts}
            </span>
          </div>
        </div>
        <div className={`${icon} bg-emerald-50 text-emerald-600`}>
          <i className="fa-solid fa-toggle-on" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}
