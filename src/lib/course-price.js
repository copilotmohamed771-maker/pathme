export function getCoursePriceDetails(
  price,
  discount = 0,
  discountedPrice,
  {
    locale = "en-EG",
    freeLabel = "Free",
    freeTrialLabel = "Free Trial",
    contactForPriceLabel = "Contact for price",
  } = {},
) {
  const rawPrice = String(price ?? "").trim();
  const numericPrice = rawPrice.replace(/[^0-9.-]/g, "");
  const originalAmount =
    typeof price === "number"
      ? price
      : /\d/.test(numericPrice)
        ? Number(numericPrice)
        : Number.NaN;
  const suppliedDiscountedPrice =
    discountedPrice == null || discountedPrice === ""
      ? Number.NaN
      : Number(discountedPrice);
  const discountPercentage = Number(discount);
  const hasDiscount =
    Number.isFinite(originalAmount) &&
    originalAmount >= 0 &&
    Number.isFinite(discountPercentage) &&
    discountPercentage > 0 &&
    discountPercentage <= 100;

  if (!Number.isFinite(originalAmount)) {
    const rawDisplayPrice = String(price ?? contactForPriceLabel);
    let displayPrice = rawDisplayPrice;
    if (rawDisplayPrice === "Contact for price") {
      displayPrice = contactForPriceLabel;
    } else if (rawDisplayPrice === "Free Trial") {
      displayPrice = freeTrialLabel;
    } else if (rawDisplayPrice === "Free") {
      displayPrice = freeLabel;
    }

    return {
      hasDiscount: false,
      price: displayPrice,
      originalPrice: "",
      discountedPrice: "",
      discountPercentage: 0,
    };
  }

  const format = (amount) =>
    new Intl.NumberFormat(locale, {
      style: "currency",
      currency: "EGP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  const calculatedDiscountedPrice = hasDiscount
    ? Math.round(
        (originalAmount * (1 - discountPercentage / 100) + Number.EPSILON) *
          100,
      ) / 100
    : originalAmount;
  const finalAmount =
    hasDiscount &&
    Number.isFinite(suppliedDiscountedPrice) &&
    suppliedDiscountedPrice >= 0
      ? suppliedDiscountedPrice
      : calculatedDiscountedPrice;
  const formattedFinalPrice =
    finalAmount === 0 ? freeLabel : format(finalAmount);

  return {
    hasDiscount,
    price: formattedFinalPrice,
    originalPrice: hasDiscount ? format(originalAmount) : "",
    discountedPrice: hasDiscount ? formattedFinalPrice : "",
    discountPercentage: hasDiscount ? discountPercentage : 0,
  };
}
