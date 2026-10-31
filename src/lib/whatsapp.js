import { INSTRUCTOR_NAME } from "./config";
import { getCoursePriceDetails } from "./course-price";

/** Build a wa.me link that opens WhatsApp with a ready-to-send message about a course. */
export function buildWhatsAppUrl(course, phoneNumber) {
  const whatsappNumber = String(phoneNumber ?? "").replace(/\D/g, "");
  if (!whatsappNumber) {
    throw new Error("The enrollment API did not return a WhatsApp phone number.");
  }

  const price = getCoursePriceDetails(
    course.priceValue ?? course.price,
    course.discount,
    course.discountedPriceValue ?? course.discountedPrice,
  );
  const message =
    `Hello ${INSTRUCTOR_NAME}, I'm interested in the "${course.title}" course and would like to get started.\n\n` +
    `Course price: ${price.price}${
      price.hasDiscount
        ? ` (discounted from ${price.originalPrice}; ${price.discountPercentage}% off)`
        : ""
    }\nDuration: ${course.duration}\n\n` +
    "Please let me know how to proceed. Thank you!";
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
}
