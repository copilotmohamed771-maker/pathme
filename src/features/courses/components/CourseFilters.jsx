"use client";

import { useId, useState } from "react";
import { ALL_GRADES_LEVEL } from "../api";
import { useLanguage } from "@/lib/language";

export function CourseFilters({
  search,
  onSearchChange,
  categories,
  selectedCategories,
  onCategoriesChange,
  levels,
  selectedLevels,
  onLevelsChange,
  minPrice,
  onMinPriceChange,
  maxPrice,
  onMaxPriceChange,
  isLoadingOptions = false,
  isApplying = false,
  canApply = false,
  onApply,
  onReset,
}) {
  const { t } = useLanguage();
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [showAllLevels, setShowAllLevels] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(true);
  const searchId = useId();
  const filtersId = useId();
  const activeCount =
    selectedCategories.length +
    selectedLevels.length +
    Number(minPrice !== "") +
    Number(maxPrice !== "") +
    Number(search.trim() !== "");

  function toggleValue(values, value, onChange) {
    onChange(
      values.includes(value)
        ? values.filter((item) => item !== value)
        : [...values, value],
    );
  }

  return (
    <section
      className="course-filter-panel rounded-3xl border border-slate-200/80 bg-white shadow-[0_14px_45px_-32px_rgba(16,24,47,0.45)]"
      aria-label={t("Course filters")}
    >
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-5">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-primary/8 text-brand-primary">
              <i className="fa-solid fa-sliders" aria-hidden="true" />
            </span>
            <h2 className="text-base font-extrabold text-brand-dark">
              {t("Find your course")}
            </h2>
            {activeCount > 0 && (
              <span className="rounded-full bg-brand-primary/8 px-2.5 py-1 text-[11px] font-bold text-brand-primary">
                {activeCount} {t("active")}
              </span>
            )}
          </div>
          <p className="mt-1.5 pl-11 text-xs text-slate-500">
            {t("Refine the catalog by topic, level, or price.")}
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          <button
            type="button"
            aria-expanded={filtersOpen}
            aria-controls={filtersId}
            onClick={() => setFiltersOpen((open) => !open)}
            className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-brand-dark transition duration-200 hover:border-brand-primary/30 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
          >
            <i
              className="fa-solid fa-sliders text-brand-primary"
              aria-hidden="true"
            />
            {t(filtersOpen ? "Hide filters" : "Show filters")}
            <i
              className={`fa-solid fa-chevron-down text-[10px] text-slate-400 transition-transform duration-200 ${filtersOpen ? "rotate-180" : ""}`}
              aria-hidden="true"
            />
          </button>
          <form
            className="flex w-full gap-2 sm:w-auto"
            onSubmit={(event) => {
              event.preventDefault();
              onApply();
            }}
          >
            <label
              htmlFor={searchId}
              className="relative block min-w-0 flex-1 sm:w-64 sm:flex-none lg:w-72"
            >
              <span className="sr-only">{t("Search courses")}</span>
              <i
                className="fa-solid fa-magnifying-glass pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
              <input
                id={searchId}
                type="search"
                value={search}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder={t("Search courses...")}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-3 pl-11 pr-4 text-sm text-brand-dark outline-none transition duration-200 placeholder:text-slate-400 hover:border-slate-300 focus:border-brand-primary focus:bg-white focus:ring-4 focus:ring-brand-primary/10"
              />
            </label>
            <button
              type="submit"
              disabled={isApplying || !canApply}
              className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-brand-primary px-4 text-sm font-bold text-white shadow-sm transition duration-200 hover:bg-[#1c3073] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isApplying ? (
                <i
                  className="fa-solid fa-spinner animate-spin"
                  aria-hidden="true"
                />
              ) : (
                <i
                  className="fa-solid fa-magnifying-glass"
                  aria-hidden="true"
                />
              )}
              {t("Search")}
            </button>
          </form>
        </div>
      </div>

      <div
        id={filtersId}
        aria-hidden={!filtersOpen}
        inert={!filtersOpen}
        className={`course-filters-collapsible ${filtersOpen ? "course-filters-collapsible-open" : ""}`}
      >
        <div className="course-filters-collapsible-inner">
          <div className="grid gap-0 divide-y divide-slate-100 border-t border-slate-100 md:grid-cols-2 md:divide-x md:divide-y-0 xl:grid-cols-[1.15fr_0.85fr_1fr]">
            <FilterChoices
              title={t("Categories")}
              icon="fa-shapes"
              values={categories}
              selectedValues={selectedCategories}
              onToggle={(value) =>
                toggleValue(selectedCategories, value, onCategoriesChange)
              }
              isLoading={isLoadingOptions}
              expanded={showAllCategories}
              onExpandedChange={setShowAllCategories}
              initialVisible={5}
            />
            <FilterChoices
              title={t("Course level")}
              icon="fa-layer-group"
              values={levels}
              selectedValues={selectedLevels}
              onToggle={(value) =>
                toggleValue(selectedLevels, value, onLevelsChange)
              }
              isLoading={isLoadingOptions}
              expanded={showAllLevels}
              onExpandedChange={setShowAllLevels}
              initialVisible={4}
              includeAllGrades
            />

            <fieldset className="min-w-0 p-5 sm:p-6">
              <legend className="sr-only">{t("Price range")}</legend>
              <div className="mb-4 flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-sm text-emerald-700">
                  <i className="fa-solid fa-tag" aria-hidden="true" />
                </span>
                <span className="text-sm font-bold text-brand-dark">
                  {t("Price range")}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <PriceInput
                  label={t("Minimum")}
                  value={minPrice}
                  onChange={onMinPriceChange}
                  placeholder={t("No minimum")}
                  id={`${searchId}-min-price`}
                />
                <PriceInput
                  label={t("Maximum")}
                  value={maxPrice}
                  onChange={onMaxPriceChange}
                  placeholder={t("No maximum")}
                  id={`${searchId}-max-price`}
                />
              </div>
              <p className="mt-2 text-[11px] text-slate-400">
                {t("Leave blank if you don’t have a limit.")}
              </p>
            </fieldset>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/60 px-5 py-3.5 sm:px-6">
            <p className="text-xs text-slate-500" aria-live="polite">
              {isLoadingOptions
                ? t("Loading filter options...")
                : t("Selections are combined to narrow your results.")}
            </p>
            <button
              type="button"
              onClick={onReset}
              disabled={activeCount === 0}
              className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold text-brand-primary transition duration-200 hover:bg-brand-primary/8 disabled:cursor-default disabled:text-slate-400 disabled:hover:bg-transparent"
            >
              <i className="fa-solid fa-rotate-left" aria-hidden="true" />
              {t("Clear all filters")}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function FilterChoices({
  title,
  icon,
  values,
  selectedValues,
  onToggle,
  isLoading,
  expanded,
  onExpandedChange,
  initialVisible,
  includeAllGrades = false,
}) {
  const { t } = useLanguage();
  const optionsId = useId();
  const choices = [
    ...(includeAllGrades
      ? [{ label: "All Grades", value: ALL_GRADES_LEVEL }]
      : []),
    ...values.map((value) => ({ label: value, value })),
  ];
  const visibleValues = expanded ? choices : choices.slice(0, initialVisible);
  const hiddenCount = Math.max(0, choices.length - initialVisible);

  return (
    <fieldset className="min-w-0 p-5 sm:p-6">
      <legend className="sr-only">{t("Filter by")} {title.toLowerCase()}</legend>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-light text-sm text-brand-primary">
            <i className={`fa-solid ${icon}`} aria-hidden="true" />
          </span>
          <span className="text-sm font-bold text-brand-dark">{title}</span>
        </div>
        {selectedValues.length > 0 && (
          <span className="text-[11px] font-semibold text-brand-primary">
            {selectedValues.length} {t("selected")}
          </span>
        )}
      </div>

      {isLoading && values.length === 0 ? (
        <p className="rounded-xl bg-slate-50 px-3 py-3 text-xs text-slate-400">
          {t("Loading options...")}
        </p>
      ) : values.length === 0 ? (
        <p className="rounded-xl bg-slate-50 px-3 py-3 text-xs text-slate-400">
          {t("No options available.")}
        </p>
      ) : (
        <>
          <div id={optionsId} className="flex flex-wrap gap-2">
            {visibleValues.map(({ label, value }, index) => {
              const checked = selectedValues.includes(value);
              return (
                <label
                  key={value}
                  className={`course-filter-choice ${expanded ? "course-filter-choice-expanded" : ""} inline-flex cursor-pointer items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold transition duration-200 ${
                    checked
                      ? "border-brand-primary/25 bg-brand-primary/8 text-brand-primary shadow-sm"
                      : "border-slate-200 bg-white text-slate-600 hover:border-brand-primary/30 hover:bg-slate-50 hover:text-brand-dark"
                  }`}
                  style={
                    expanded
                      ? { animationDelay: `${Math.min(index, 8) * 25}ms` }
                      : undefined
                  }
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onToggle(value)}
                    className="course-filter-checkbox sr-only"
                  />
                  <span
                    className={`flex h-4 w-4 items-center justify-center rounded-full border transition ${
                      checked
                        ? "border-brand-primary bg-brand-primary text-white"
                        : "border-slate-300 bg-white text-transparent"
                    }`}
                    aria-hidden="true"
                  >
                    <i className="fa-solid fa-check text-[8px]" />
                  </span>
                  {t(label)}
                </label>
              );
            })}
          </div>
          {hiddenCount > 0 && (
            <button
              type="button"
              aria-expanded={expanded}
              aria-controls={optionsId}
              onClick={() => onExpandedChange((current) => !current)}
              className="mt-3 inline-flex items-center gap-1.5 rounded-md text-xs font-bold text-brand-primary transition hover:text-brand-innovation focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
            >
              {expanded ? t("Show less") : `${t("Show")} ${hiddenCount} ${t("more")}`}
              <i
                className={`fa-solid fa-chevron-down text-[9px] transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
                aria-hidden="true"
              />
            </button>
          )}
        </>
      )}
    </fieldset>
  );
}

function PriceInput({ label, value, onChange, placeholder, id }) {
  return (
    <label
      htmlFor={id}
      className="min-w-0 text-[11px] font-semibold text-slate-500"
    >
      {label}
      <span className="relative mt-1.5 block">
        <span
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400"
          aria-hidden="true"
        >
          $
        </span>
        <input
          id={id}
          type="number"
          min="0"
          step="any"
          inputMode="decimal"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2.5 pl-7 pr-2 text-sm text-brand-dark outline-none transition duration-200 placeholder:text-slate-400 hover:border-slate-300 focus:border-brand-primary focus:bg-white focus:ring-4 focus:ring-brand-primary/10"
        />
      </span>
    </label>
  );
}
