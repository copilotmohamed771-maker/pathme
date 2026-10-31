import { CoursePrice } from "@/components/ui/CoursePrice";

export function CourseCards({
  courses,
  onToggleActive,
  updatingCourseId,
  onDuplicate,
  duplicatingCourseId,
  onEdit,
  editingCourseId,
  onDelete,
  onViewEnrollments,
}) {
  if (courses.length === 0) {
    return (
      <div className="bg-white p-8 rounded-2xl text-center text-gray-400 text-xs border border-gray-200">
        No courses match your filter settings.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
      {courses.map((c) => (
        <article
          key={c.id}
          className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-900/5"
        >
          <div>
            <div
              className="relative flex h-36 flex-col justify-between bg-gradient-to-r from-brand-primary to-slate-800 p-4 text-white"
              style={
                c.image
                  ? {
                      backgroundImage: `linear-gradient(rgba(16,24,47,0.7), rgba(16,24,47,0.85)), url("${c.image}")`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }
                  : undefined
              }
            >
              <div className="flex items-center justify-between">
                <span className="rounded-lg border border-white/20 bg-white/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white backdrop-blur-xs">
                  {c.category}
                </span>
                <span
                  className={`rounded-lg px-2.5 py-1 text-[10px] font-bold text-white ${
                    c.isActive ? "bg-emerald-500" : "bg-gray-400"
                  }`}
                >
                  {c.isActive ? "Active" : "Draft"}
                </span>
              </div>
              <div className="flex items-end justify-between">
                <div className="flex flex-col items-start gap-1.5">
                  <span className="text-xs font-semibold text-gray-200">
                    {c.duration || "Flexible"}
                  </span>
                  <span className="rounded-md border border-white/20 bg-white/15 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-xs">
                    {c.level === "ALLGRADES"
                      ? "All grades"
                      : c.level.charAt(0) + c.level.slice(1).toLowerCase()}
                  </span>
                </div>
                <CoursePrice
                  price={c.priceValue ?? c.price}
                  discount={c.discount}
                  discountedPrice={c.discountedPriceValue ?? c.discountedPrice}
                  className="text-base font-extrabold text-white"
                  originalClassName="text-xs font-semibold text-white/70 line-through"
                  discountClassName="text-[10px] font-bold text-amber-200"
                />
              </div>
            </div>

            <div className="space-y-3 p-5">
              <h3 className="text-base font-bold leading-snug text-brand-dark">{c.title}</h3>
              <p className="line-clamp-2 text-sm leading-6 text-gray-500">{c.description}</p>

              {c.outcomes?.length > 0 && (
                <div className="border-t border-gray-100 pt-3">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-brand-innovation">
                    Key Learning:
                  </p>
                  <p className="mt-1 truncate text-xs text-gray-600">{c.outcomes[0]}</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-gray-100 bg-slate-50/80 px-4 py-3">
            <button
              type="button"
              onClick={() => onToggleActive(c.id)}
              disabled={updatingCourseId === c.id}
              className={`text-[11px] font-semibold transition flex items-center space-x-1 ${
                c.isActive
                  ? "text-amber-600 hover:text-amber-800"
                  : "text-emerald-600 hover:text-emerald-800"
              } disabled:cursor-wait disabled:opacity-50`}
            >
              <i
                className={`fa-solid ${
                  updatingCourseId === c.id
                    ? "fa-spinner animate-spin"
                    : "fa-power-off"
                }`}
                aria-hidden="true"
              />
              <span>
                {updatingCourseId === c.id
                  ? "Updating..."
                  : c.isActive
                    ? "Make Draft"
                    : "Publish"}
              </span>
            </button>

            <div className="flex items-center space-x-2">
              <IconButton
                label={duplicatingCourseId === c.id ? "Duplicating" : "Duplicate"}
                icon={
                  duplicatingCourseId === c.id
                    ? "fa-solid fa-spinner fa-spin"
                    : "fa-regular fa-copy"
                }
                hover="hover:text-brand-primary"
                onClick={() => onDuplicate(c.id)}
                disabled={Boolean(duplicatingCourseId)}
              />
              <IconButton
                label={editingCourseId === c.id ? "Loading course" : "Edit"}
                icon={
                  editingCourseId === c.id
                    ? "fa-solid fa-spinner fa-spin"
                    : "fa-regular fa-pen-to-square"
                }
                hover="hover:text-brand-innovation"
                onClick={() => onEdit(c)}
                disabled={Boolean(editingCourseId)}
              />
              <IconButton
                label="Delete"
                icon="fa-regular fa-trash-can"
                hover="hover:text-red-500"
                onClick={() => onDelete(c.id)}
              />
            </div>
          </div>
          <div className="border-t border-gray-100 px-4 py-3">
            <button
              type="button"
              onClick={() => onViewEnrollments(c)}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-primary/5 px-3 py-2 text-xs font-bold text-brand-primary transition hover:bg-brand-primary hover:text-white"
            >
              <i className="fa-solid fa-users" aria-hidden="true" />
              View enrollments
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}

function IconButton({ label, icon, hover, onClick, disabled = false }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className={`p-1.5 rounded-lg text-gray-400 hover:bg-gray-200/60 transition disabled:cursor-wait disabled:opacity-50 ${hover}`}
    >
      <i className={icon} aria-hidden="true" />
    </button>
  );
}
