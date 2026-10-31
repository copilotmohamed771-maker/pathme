"use client";

import { useEffect, useState } from "react";
import {
  ALL_GRADES_LEVEL,
  fetchCourseFilterOptions,
  fetchCoursePage,
  fetchFilteredCoursePage,
} from "../api";
import { CourseFilters } from "./CourseFilters";
import { CourseGrid } from "./CourseGrid";
import { useLanguage } from "@/lib/language";

export function CatalogBrowser({
  initialCategory = [],
  initialLevels = [],
  initialQuery = "",
  initialMinPrice = "",
  initialMaxPrice = "",
}) {
  const { language, languageReady, t } = useLanguage();
  const [categories, setCategories] = useState([]);
  const [levels, setLevels] = useState([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState(initialCategory);
  const [selectedLevels, setSelectedLevels] = useState(initialLevels);
  const [search, setSearch] = useState(initialQuery);
  const [minPrice, setMinPrice] = useState(initialMinPrice);
  const [maxPrice, setMaxPrice] = useState(initialMaxPrice);
  const [appliedFilters, setAppliedFilters] = useState(() => ({
    search: initialQuery.trim(),
    categories: initialCategory,
    levels: initialLevels,
    minPrice: initialMinPrice,
    maxPrice: initialMaxPrice,
  }));
  const [page, setPage] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);
  const [pageData, setPageData] = useState(null);
  const [error, setError] = useState("");
  const [filterOptionsError, setFilterOptionsError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const hasInvalidPriceRange =
    minPrice !== "" && maxPrice !== "" && Number(minPrice) > Number(maxPrice);
  const hasDraftFilters = Boolean(
    search.trim() ||
    selectedCategories.length ||
    selectedLevels.length ||
    minPrice !== "" ||
    maxPrice !== "",
  );

  useEffect(() => {
    if (!languageReady) return undefined;
    const controller = new AbortController();
    fetchCourseFilterOptions(controller.signal)
      .then(({ categories: availableCategories, levels: availableLevels }) => {
        setCategories(availableCategories);
        setLevels(availableLevels);
        setSelectedCategories((selected) =>
          selected.filter((value) => availableCategories.includes(value)),
        );
        setSelectedLevels((selected) =>
          selected.filter(
            (value) =>
              value === ALL_GRADES_LEVEL || availableLevels.includes(value),
          ),
        );
      })
      .catch((requestError) => {
        if (!controller.signal.aborted) {
          setSelectedCategories([]);
          setSelectedLevels([]);
          setFilterOptionsError(requestError.message);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoadingOptions(false);
      });

    return () => controller.abort();
  }, [language, languageReady]);

  useEffect(() => {
    if (!languageReady) return undefined;
    const controller = new AbortController();
    const request = hasAppliedFilters(appliedFilters)
      ? fetchFilteredCoursePage({
          page,
          ...appliedFilters,
          signal: controller.signal,
        })
      : fetchCoursePage({ page, signal: controller.signal });

    request
      .then((result) => {
        setPageData(result);
        setError("");
      })
      .catch((requestError) => {
        if (!controller.signal.aborted) setError(requestError.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [page, appliedFilters, refreshKey, language, languageReady]);

  function applyFilters() {
    if (hasInvalidPriceRange || !hasDraftFilters) return;
    setIsLoading(true);
    setError("");
    setAppliedFilters({
      search: search.trim(),
      categories: selectedCategories,
      levels: selectedLevels,
      minPrice,
      maxPrice,
    });
    setPage(1);
  }

  function clearFilters() {
    setSearch("");
    setSelectedCategories([]);
    setSelectedLevels([]);
    setMinPrice("");
    setMaxPrice("");
    setAppliedFilters({});
    setIsLoading(true);
    setError("");
    setPage(1);
  }

  function loadPage(nextPage) {
    setIsLoading(true);
    setError("");
    setPage(nextPage);
  }

  return (
    <div className="space-y-8">
      <CourseFilters
        search={search}
        onSearchChange={setSearch}
        categories={categories}
        selectedCategories={selectedCategories}
        onCategoriesChange={setSelectedCategories}
        levels={levels}
        selectedLevels={selectedLevels}
        onLevelsChange={setSelectedLevels}
        minPrice={minPrice}
        onMinPriceChange={setMinPrice}
        maxPrice={maxPrice}
        onMaxPriceChange={setMaxPrice}
        isLoadingOptions={isLoadingOptions}
        isApplying={isLoading}
        canApply={hasDraftFilters && !hasInvalidPriceRange}
        onApply={applyFilters}
        onReset={clearFilters}
      />

      {filterOptionsError && (
        <p
          className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
          role="status"
        >
          {t("Course filters could not be fully loaded, but you can still browse courses.")}
        </p>
      )}

      {hasInvalidPriceRange ? (
        <div
          className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900"
          role="alert"
        >
          {t("Minimum price must be less than or equal to maximum price.")}
        </div>
      ) : isLoading ? (
        <div
          className="rounded-3xl border border-gray-100 bg-white py-16 text-center text-sm font-semibold text-gray-500"
          role="status"
        >
          <i
            className="fa-solid fa-spinner mr-2 animate-spin"
            aria-hidden="true"
          />
          {t("Loading courses...")}
        </div>
      ) : error ? (
        <div
          className="rounded-3xl border border-red-100 bg-white px-6 py-16 text-center"
          role="alert"
        >
          <h2 className="text-xl font-bold text-brand-dark">
            {t("Could not load courses")}
          </h2>
          <p className="mt-2 text-sm text-gray-500">{error}</p>
          <button
            type="button"
            onClick={() => {
              setIsLoading(true);
              setError("");
              setRefreshKey((key) => key + 1);
            }}
            className="mt-5 rounded-xl bg-brand-primary px-6 py-3 text-sm font-bold text-white transition hover:bg-[#1c3073]"
          >
            {t("Try again")}
          </button>
        </div>
      ) : pageData?.courses.length ? (
        <>
          <CourseGrid courses={pageData.courses} />
          <CoursePagination pageData={pageData} onPageChange={loadPage} />
        </>
      ) : (
        <div className="rounded-3xl border border-dashed border-gray-300 bg-white py-16 text-center">
          <h2 className="text-xl font-bold text-brand-dark">
            {t("No courses match these filters")}
          </h2>
          <p className="mt-1 text-gray-500">
            {t("Try changing your search or filters.")}
          </p>
          <CoursePagination pageData={pageData} onPageChange={loadPage} />
        </div>
      )}
    </div>
  );
}

function hasAppliedFilters(filters) {
  return Boolean(
    filters.search ||
    filters.categories?.length ||
    filters.levels?.length ||
    (filters.minPrice != null && filters.minPrice !== "") ||
    (filters.maxPrice != null && filters.maxPrice !== ""),
  );
}

function CoursePagination({ pageData, onPageChange }) {
  const { t } = useLanguage();
  if (!pageData || pageData.totalPages <= 1) return null;

  return (
    <nav
      className="mt-8 flex items-center justify-center gap-4"
      aria-label={t("Course pages")}
    >
      <button
        type="button"
        disabled={pageData.first}
        onClick={() => onPageChange(Math.max(1, pageData.page - 1))}
        className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-brand-primary transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {t("Previous")}
      </button>
      <span className="text-sm font-semibold text-gray-500" aria-live="polite">
        {t("Page")} {pageData.page} {t("of")} {pageData.totalPages} · {pageData.totalElements}{" "}
        {t("courses")}
      </span>
      <button
        type="button"
        disabled={pageData.last}
        onClick={() => onPageChange(pageData.page + 1)}
        className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-brand-primary transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {t("Next")}
      </button>
    </nav>
  );
}
