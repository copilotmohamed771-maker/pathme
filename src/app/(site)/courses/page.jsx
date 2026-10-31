import { Suspense } from "react";
import { CatalogBrowser } from "@/features/courses/components/CatalogBrowser";
import { CourseCatalogIntro } from "@/features/courses/components/CourseCatalogIntro";

export const metadata = { title: "Courses" };

const values = (value) => {
  if (Array.isArray(value)) return value;
  return value ? [value] : [];
};

const first = (value) => values(value)[0];

export default function CoursesPage({ searchParams }) {
  return (
    <section className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <CourseCatalogIntro />

      {/* searchParams is runtime data, so it is read inside Suspense; the heading above stays static. */}
      <Suspense fallback={<CatalogBrowser />}>
        <FilteredCatalog searchParams={searchParams} />
      </Suspense>
    </section>
  );
}

async function FilteredCatalog({ searchParams }) {
  const params = await searchParams;
  const categories = values(params.category);
  const levels = values(params.level);
  const search = first(params.search) ?? first(params.q) ?? "";
  const minPrice = first(params.minPrice) ?? "";
  const maxPrice = first(params.maxPrice) ?? "";

  return (
    // key remounts the browser when URL filters change.
    <CatalogBrowser
      key={JSON.stringify([categories, levels, search, minPrice, maxPrice])}
      initialCategory={categories}
      initialLevels={levels}
      initialQuery={search}
      initialMinPrice={minPrice}
      initialMaxPrice={maxPrice}
    />
  );
}
