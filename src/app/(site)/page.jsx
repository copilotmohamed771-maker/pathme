"use client";

import Link from "next/link";
import { FeaturedCourses } from "@/features/home/components/FeaturedCourses";
import { Hero } from "@/features/home/components/Hero";
import { Pillars } from "@/features/home/components/Pillars";
import { useLanguage } from "@/lib/language";

export default function HomePage() {
  const { t } = useLanguage();

  return (
    <div className="space-y-16 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Hero />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Pillars />
      </div>

      <section className="home-featured-enter max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-brand-energy">
              {t("Featured Pathways")}
            </span>
            <h2 className="text-3xl font-extrabold text-brand-dark mt-1">
              {t("Popular Courses for Students")}
            </h2>
          </div>
          <Link
            href="/courses"
            className="mt-4 md:mt-0 text-brand-primary font-bold hover:text-brand-innovation inline-flex items-center"
          >
            {t("View All Courses")}{" "}
            <i
              className="fa-solid fa-arrow-right ml-2 text-sm"
              aria-hidden="true"
            />
          </Link>
        </div>
        <FeaturedCourses />
      </section>
    </div>
  );
}
