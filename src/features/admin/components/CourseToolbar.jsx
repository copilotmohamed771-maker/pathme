"use client";

import { useState } from "react";
import { ADMIN_COURSE_LEVELS } from "../api";

const LEVEL_LABELS = {
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
  ALLGRADES: "All grades",
};

const DATE_FIELDS = [
  {
    label: "Created Date",
    from: "createdFrom",
    to: "createdTo",
  },
  {
    label: "Last Updated Date",
    from: "updatedFrom",
    to: "updatedTo",
  },
];

export function CourseToolbar({
  filters,
  onFiltersChange,
  onApplyFilters,
  categories,
  categoriesError,
  categoriesLoading,
  viewMode,
  onViewModeChange,
}) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [validationError, setValidationError] = useState("");

  function updateField(field, value) {
    setValidationError("");
    onFiltersChange({ ...filters, [field]: value });
  }

  function toggleSelected(field, value) {
    const currentValues = filters[field] || [];
    const nextValues = currentValues.includes(value)
      ? currentValues.filter((item) => item !== value)
      : [...currentValues, value];
    updateField(field, nextValues);
  }

  function validateDateRanges() {
    for (const { label, from, to } of DATE_FIELDS) {
      if (filters[from] && filters[to] && filters[from] > filters[to]) {
        setValidationError(`${label}: the From date must be on or before the To date.`);
        return false;
      }
    }
    setValidationError("");
    return true;
  }

  function handleSearch(event) {
    event.preventDefault();
    if (validateDateRanges()) onApplyFilters();
  }

  function handleStatusChange(status) {
    const nextFilters = { ...filters, status };
    updateField("status", status);
    onApplyFilters(nextFilters);
  }

  function handleSortChange(sort) {
    const nextFilters = { ...filters, sort };
    updateField("sort", sort);
    onApplyFilters(nextFilters);
  }

  function handleClearFilters() {
    setValidationError("");
    const clearedFilters = {
      query: "",
      categories: [],
      levels: [],
      createdFrom: "",
      createdTo: "",
      updatedFrom: "",
      updatedTo: "",
      status: "all",
      sort: "DESC",
    };
    onFiltersChange(clearedFilters);
    onApplyFilters(clearedFilters);
  }

  const selectedCount =
    (filters.categories?.length || 0) +
    (filters.levels?.length || 0) +
    (filters.query ? 1 : 0) +
    Number(filters.status !== "all") +
    DATE_FIELDS.reduce(
      (count, { from, to }) =>
        count + Number(Boolean(filters[from])) + Number(Boolean(filters[to])),
      0,
    );

  return (
    <div className="space-y-4">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-lg font-bold text-brand-dark">
            Course management
          </h2>
          <p className="text-xs text-gray-400">
            Search and filter courses by category, level, or date.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            aria-expanded={filtersOpen}
            onClick={() => setFiltersOpen((open) => !open)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:border-brand-primary/30 hover:text-brand-primary"
          >
            <i className="fa-solid fa-sliders" aria-hidden="true" />
            Filters
            {selectedCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-primary px-1.5 text-[10px] text-white">
                {selectedCount}
              </span>
            )}
            <i
              className={`fa-solid fa-chevron-down text-[10px] transition-transform ${filtersOpen ? "rotate-180" : ""}`}
              aria-hidden="true"
            />
          </button>

          <label className="sr-only" htmlFor="course-status-filter">
            Filter by status
          </label>
          <select
            id="course-status-filter"
            value={filters.status}
            onChange={(event) => handleStatusChange(event.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 outline-none transition focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10"
          >
            <option value="all">All statuses</option>
            <option value="PUBLISH">Published</option>
            <option value="DRAFT">Draft</option>
          </select>

          <label className="sr-only" htmlFor="course-sort">
            Sort courses
          </label>
          <select
            id="course-sort"
            value={filters.sort || "DESC"}
            onChange={(event) => handleSortChange(event.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 outline-none transition focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10"
          >
            <option value="DESC">Newest first</option>
            <option value="ASC">Oldest first</option>
          </select>

          <div
            role="group"
            aria-label="View mode"
            className="flex rounded-xl bg-slate-100 p-1"
          >
            {[
              { mode: "grid", icon: "fa-grip", label: "Grid view" },
              { mode: "table", icon: "fa-list", label: "Table view" },
            ].map(({ mode, icon, label }) => (
              <button
                key={mode}
                type="button"
                aria-label={label}
                aria-pressed={viewMode === mode}
                onClick={() => onViewModeChange(mode)}
                className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold ${
                  viewMode === mode
                    ? "bg-white text-brand-primary shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <i className={`fa-solid ${icon}`} aria-hidden="true" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {filtersOpen && (
        <form
          onSubmit={handleSearch}
          className="space-y-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
        >
          <div className="grid gap-4 lg:grid-cols-2">
            <div>
              <label
                htmlFor="course-search"
                className="mb-1.5 block text-xs font-bold text-slate-600"
              >
                Search course name
              </label>
              <div className="relative">
                <i
                  className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400"
                  aria-hidden="true"
                />
                <input
                  id="course-search"
                  type="search"
                  value={filters.query}
                  onChange={(event) => updateField("query", event.target.value)}
                  placeholder="Type a course name..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-brand-primary focus:bg-white focus:ring-4 focus:ring-brand-primary/10"
                />
              </div>
            </div>

            <fieldset>
              <legend className="mb-1.5 text-xs font-bold text-slate-600">
                Categories
                <span className="ml-1 font-normal text-slate-400">
                  (select any)
                </span>
              </legend>
              {categoriesLoading ? (
                <p className="rounded-xl bg-slate-50 px-3 py-2.5 text-xs text-slate-500">
                  Loading categories...
                </p>
              ) : categoriesError ? (
                <p role="alert" className="text-xs text-rose-600">
                  {categoriesError}
                </p>
              ) : categories.length ? (
                <div className="flex max-h-28 flex-wrap gap-2 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-2.5">
                  {categories.map((category) => (
                    <label
                      key={category.id || category.name}
                      className={`inline-flex cursor-pointer items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition ${
                        filters.categories?.includes(category.name)
                          ? "border-brand-primary/30 bg-brand-primary/5 text-brand-primary"
                          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={Boolean(
                          filters.categories?.includes(category.name),
                        )}
                        onChange={() =>
                          toggleSelected("categories", category.name)
                        }
                        className="accent-brand-primary"
                      />
                      {category.name}
                    </label>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500">No categories found.</p>
              )}
            </fieldset>

            <fieldset className="lg:col-span-2">
              <legend className="mb-1.5 text-xs font-bold text-slate-600">
                Course levels
                <span className="ml-1 font-normal text-slate-400">
                  (select any)
                </span>
              </legend>
              <div className="flex flex-wrap gap-2">
                {ADMIN_COURSE_LEVELS.map((level) => (
                  <label
                    key={level}
                    className={`inline-flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition ${
                      filters.levels?.includes(level)
                        ? "border-brand-primary/30 bg-brand-primary/5 text-brand-primary"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={Boolean(filters.levels?.includes(level))}
                      onChange={() => toggleSelected("levels", level)}
                      className="accent-brand-primary"
                    />
                    {LEVEL_LABELS[level]}
                  </label>
                ))}
              </div>
            </fieldset>
          </div>

          <fieldset className="border-t border-slate-100 pt-4">
            <legend className="px-1 text-sm font-bold text-brand-dark">
              Date filters
            </legend>
            <div className="mt-2 grid gap-4 md:grid-cols-2">
              {DATE_FIELDS.map(({ label, from, to }) => (
                <div
                  key={label}
                  className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5"
                >
                  <h3 className="mb-3 text-xs font-bold text-slate-700">
                    {label}
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { key: from, name: "From" },
                      { key: to, name: "To" },
                    ].map(({ key, name }) => (
                      <div key={key}>
                        <label
                          htmlFor={key}
                          className="mb-1 block text-[11px] font-semibold text-slate-500"
                        >
                          {name}
                        </label>
                        <input
                          id={key}
                          type="date"
                          value={filters[key] || ""}
                          onChange={(event) =>
                            updateField(key, event.target.value)
                          }
                          className="w-full rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs text-slate-700 outline-none transition focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </fieldset>

          {validationError && (
            <p
              role="alert"
              className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-medium text-rose-700"
            >
              <i className="fa-solid fa-circle-exclamation mr-2" aria-hidden="true" />
              {validationError}
            </p>
          )}

          <div className="flex flex-col-reverse justify-between gap-2 border-t border-slate-100 pt-4 sm:flex-row">
            <button
              type="button"
              onClick={handleClearFilters}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50"
            >
              Clear filters
            </button>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-primary px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-blue-900"
            >
              <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
              Search courses
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
