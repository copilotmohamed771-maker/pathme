import { CoursePrice } from "@/components/ui/CoursePrice";

export function CourseTable({
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
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th scope="col" className="py-3 px-4">
                Course
              </th>
              <th scope="col" className="py-3 px-4">
                Category
              </th>
              <th scope="col" className="py-3 px-4">
                Price
              </th>
              <th scope="col" className="py-3 px-4">
                Duration
              </th>
              <th scope="col" className="py-3 px-4">
                Status
              </th>
              <th scope="col" className="py-3 px-4 text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {courses.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-6 text-center text-gray-400 text-xs">
                  No courses match your filter criteria.
                </td>
              </tr>
            ) : (
              courses.map((c) => (
                <tr key={c.id} className="transition hover:bg-slate-50/80">
                  <th scope="row" className="py-4 px-4 font-semibold text-brand-dark">
                    {c.title}
                  </th>
                  <td className="py-4 px-4 text-gray-500">{c.category}</td>
                  <td className="py-4 px-4 font-semibold text-brand-primary">
                    <CoursePrice
                      price={c.priceValue ?? c.price}
                      discount={c.discount}
                      discountedPrice={c.discountedPriceValue ?? c.discountedPrice}
                      className="text-sm font-semibold"
                    />
                  </td>
                  <td className="py-4 px-4 text-gray-500">{c.duration || "N/A"}</td>
                  <td className="py-4 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        c.isActive ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {c.isActive ? "Active" : "Draft"}
                    </span>
                  </td>
                  <td className="space-x-1 px-4 py-4 text-right">
                    <button
                      type="button"
                      onClick={() => onDuplicate(c.id)}
                      disabled={Boolean(duplicatingCourseId)}
                      className="px-2 py-1 rounded bg-brand-primary/5 hover:bg-brand-primary/10 text-brand-primary text-[10px] font-semibold transition disabled:cursor-wait disabled:opacity-50"
                    >
                      {duplicatingCourseId === c.id
                        ? "Duplicating..."
                        : "Duplicate"}
                    </button>
                    <button
                      type="button"
                      onClick={() => onToggleActive(c.id)}
                      disabled={updatingCourseId === c.id}
                      className="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 text-[10px] font-semibold disabled:cursor-wait disabled:opacity-50"
                    >
                      {updatingCourseId === c.id
                        ? "Updating..."
                        : c.isActive
                          ? "Unpublish"
                          : "Publish"}
                    </button>
                    <button
                      type="button"
                      onClick={() => onEdit(c)}
                      disabled={Boolean(editingCourseId)}
                      className="px-2 py-1 rounded bg-brand-primary/10 hover:bg-brand-primary text-brand-primary hover:text-white text-[10px] font-semibold transition disabled:cursor-wait disabled:opacity-50"
                    >
                      {editingCourseId === c.id ? "Loading..." : "Edit"}
                    </button>
                    <button
                      type="button"
                      onClick={() => onViewEnrollments(c)}
                      className="px-2 py-1 rounded bg-brand-innovation/10 text-brand-primary hover:bg-brand-innovation/20 text-[10px] font-semibold"
                    >
                      Enrollments
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(c.id)}
                      className="px-2 py-1 rounded bg-red-50 hover:bg-red-500 text-red-600 hover:text-white text-[10px] font-semibold transition"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
