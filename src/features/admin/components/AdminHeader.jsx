import { Logo } from "@/components/ui/Logo";

export function AdminHeader({
  onAddCourse,
  onOpenSettings,
  onLogout,
  isLoggingOut,
}) {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Logo size="sm" />
          <span className="border-l border-gray-200 pl-3 text-xs font-medium text-gray-400">
            Admin
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenSettings}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-brand-primary"
          >
            <i className="fa-solid fa-gear" aria-hidden="true" />
            <span>Settings</span>
          </button>
          <button
            type="button"
            onClick={onAddCourse}
            className="px-3.5 py-2 rounded-xl bg-brand-primary hover:bg-blue-900 text-white font-semibold text-xs transition flex items-center space-x-1.5 shadow-sm"
          >
            <i className="fa-solid fa-plus" aria-hidden="true" />
            <span className="hidden sm:inline">Add Course</span>
            <span className="sr-only sm:hidden">Add Course</span>
          </button>
          <button
            type="button"
            onClick={onLogout}
            disabled={isLoggingOut}
            className="inline-flex items-center gap-1.5 rounded-xl border border-red-100 px-3.5 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-wait disabled:opacity-60"
          >
            <i
              className={`fa-solid ${isLoggingOut ? "fa-spinner fa-spin" : "fa-arrow-right-from-bracket"}`}
              aria-hidden="true"
            />
            <span>{isLoggingOut ? "Logging out..." : "Log out"}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
