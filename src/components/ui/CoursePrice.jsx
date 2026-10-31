"use client";

import { getCoursePriceDetails } from "@/lib/course-price";
import { useOptionalLanguage } from "@/lib/language";

export function CoursePrice({
  price,
  discount,
  discountedPrice,
  className = "",
  originalClassName = "text-slate-400 line-through",
  discountClassName = "text-rose-600",
}) {
  const languageContext = useOptionalLanguage();
  const language = languageContext?.language || "en";
  const t = languageContext?.t || ((text) => text);
  const details = getCoursePriceDetails(
    price,
    discount,
    discountedPrice,
    {
      locale: language === "ar" ? "ar-EG" : "en-EG",
      freeLabel: t("Free"),
      freeTrialLabel: t("Free Trial"),
      contactForPriceLabel: t("Contact for price"),
    },
  );

  return (
    <span className={`inline-flex flex-wrap items-baseline gap-x-2 gap-y-1 ${className}`}>
      {details.hasDiscount && (
        <>
          {details.originalPrice && (
            <span className={originalClassName}>{details.originalPrice}</span>
          )}
          <span className={discountClassName}>
            <i className="fa-solid fa-star mr-1" aria-hidden="true" />
            {language === "ar"
              ? `${details.discountPercentage.toLocaleString("ar-EG")}٪ ${t("off")}`
              : `${details.discountPercentage}% ${t("off")}`}
          </span>
        </>
      )}
      <span>{details.price}</span>
    </span>
  );
}
