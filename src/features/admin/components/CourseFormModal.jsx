"use client";

import { useEffect, useRef, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { CoursePrice } from "@/components/ui/CoursePrice";
import {
  createAdminCategory,
  fetchAdminCategories,
} from "../api";

const LEVELS = ["BEGINNER", "INTERMEDIATE", "ADVANCED", "ALLGRADES"];
const STATUSES = ["DRAFT", "PUBLISH"];
const FIELD =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10";
const LABEL = "mb-1.5 block text-xs font-bold text-slate-600";
const STEPS = ["Category", "Course details", "Course images"];
const DURATION_UNITS = ["days", "weeks", "months"];

function parseDuration(value = "") {
  const match = String(value).trim().match(/^(\d+)\s*(days?|weeks?|months?)$/i);
  if (!match) return { amount: "", unit: "weeks" };

  const unit = match[2].toLowerCase().replace(/s$/, "");
  return {
    amount: match[1],
    unit: `${unit}s`,
  };
}

export function CourseFormModal({ target, onClose, onSave }) {
  const editing = target !== null && target !== "new" ? target : null;
  const open = target !== null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? "Edit course" : "Create a course"}
      variant="admin"
      maxWidth="max-w-3xl"
      padding="p-5 sm:p-8"
    >
      {open && (
        <CourseFormWizard
          key={editing?.id ?? "new"}
          editing={editing}
          onClose={onClose}
          onSave={onSave}
        />
      )}
    </Modal>
  );
}

function CourseFormWizard({ editing, onClose, onSave }) {
  const [step, setStep] = useState(editing ? 2 : 1);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState("");
  const [categoryRetry, setCategoryRetry] = useState(0);
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState(editing?.description ?? "");
  const [descriptionAr, setDescriptionAr] = useState(
    editing?.descriptionAr ?? "خممخم",
  );
  const [newCategoryName, setNewCategoryName] = useState("");
  const [addingCategory, setAddingCategory] = useState(false);
  const [categorySubmitting, setCategorySubmitting] = useState(false);
  const [outcomes, setOutcomes] = useState(() =>
    editing?.outcomes?.length ? editing.outcomes : [""],
  );
  const [priceAmount, setPriceAmount] = useState(
    editing?.priceValue != null &&
      Number.isFinite(Number(editing.priceValue))
      ? String(editing.priceValue)
      : "",
  );
  const [discount, setDiscount] = useState(
    String(editing?.discount ?? editing?.discountPercentage ?? 0),
  );
  const initialDuration = parseDuration(editing?.duration);
  const [durationAmount, setDurationAmount] = useState(initialDuration.amount);
  const [durationUnit, setDurationUnit] = useState(initialDuration.unit);
  const [courseImg, setCourseImg] = useState(null);
  const [roadmapImg, setRoadmapImg] = useState(null);
  const [clearCourseImg, setClearCourseImg] = useState(false);
  const [clearRoadmapImg, setClearRoadmapImg] = useState(false);
  const courseImgInputRef = useRef(null);
  const roadmapImgInputRef = useRef(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    fetchAdminCategories(controller.signal)
      .then((categoryList) => {
        setCategories(categoryList);
        setCategoriesLoading(false);
      })
      .catch((requestError) => {
        if (!controller.signal.aborted) {
          setCategoriesError(
            requestError.message || "Could not load categories.",
          );
          setCategoriesLoading(false);
        }
      });

    return () => controller.abort();
  }, [categoryRetry]);

  const title = editing ? "Edit course" : "Create a course";
  const editingCategoryId =
    editing?.categoryId ?? editing?.category?.id ?? editing?.category?.categoryId;
  const resolvedCategoryId =
    categoryId ||
    categories.find((category) => category.id === String(editingCategoryId))
      ?.id ||
    categories.find((category) => category.name === editing?.category)?.id ||
    "";
  const selectedCategory = categories.find(
    (category) => category.id === resolvedCategoryId,
  );

  async function handleCreateCategory() {
    const name = newCategoryName.trim();
    if (!name) {
      setCategoriesError("Enter a category name.");
      return;
    }
    if (
      categories.some(
        (category) => category.name.toLowerCase() === name.toLowerCase(),
      )
    ) {
      setCategoriesError("That category already exists. Select it from the list.");
      return;
    }

    setCategorySubmitting(true);
    setCategoriesError("");
    try {
      const created = await createAdminCategory(name);
      setCategories((current) =>
        [...current.filter((category) => category.id !== created.id), created].sort(
          (a, b) => a.name.localeCompare(b.name),
        ),
      );
      setCategoryId(created.id);
      setNewCategoryName("");
      setAddingCategory(false);
    } catch (requestError) {
      setCategoriesError(
        requestError.message || "Could not create the category.",
      );
    } finally {
      setCategorySubmitting(false);
    }
  }

  function validateDetails(form) {
    const fields = form.querySelectorAll("[data-details-field]");
    for (const field of fields) {
      if (!field.checkValidity()) {
        field.reportValidity();
        return false;
      }
    }
    return true;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (step < STEPS.length) {
      if (step === 1 && !resolvedCategoryId) {
        setError("Choose or create a category before continuing.");
        return;
      }
      if (step === 2 && !validateDetails(event.currentTarget)) return;
      setStep((current) => current + 1);
      return;
    }

    if (!resolvedCategoryId) {
      setStep(1);
      setError("Choose a category before saving.");
      return;
    }
    if (!validateDetails(event.currentTarget)) {
      setStep(2);
      return;
    }
    const data = new FormData(event.currentTarget);
    const text = (name) => String(data.get(name) ?? "").trim();
    const status = text("status");
    const course = {
      name: text("name"),
      description: text("description"),
      descriptionAr: text("descriptionAr"),
      price: Number(text("price")),
      discount: Number(text("discount") || 0),
      whatYouWillLearn: outcomes.map((outcome) => outcome.trim()).filter(Boolean),
      duration: `${text("durationAmount")} ${
        Number(text("durationAmount")) === 1
          ? text("durationUnit").slice(0, -1)
          : text("durationUnit")
      }`,
      level: text("level"),
      categoryId: resolvedCategoryId,
      status,
    };
    if (editing && clearCourseImg && !courseImg) course.courseImg = null;
    if (editing && clearRoadmapImg && !roadmapImg) course.roadmapImg = null;

    setSaving(true);
    try {
      if (editing) {
        await onSave({
          id: editing.id,
          course,
          courseImg,
          roadmapImg,
        });
      } else {
        await onSave({ course, courseImg, roadmapImg });
      }
    } catch (requestError) {
      setError(requestError.message || "Could not save the course.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
        <header className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-primary">
              Course builder
            </p>
            <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-brand-dark">
              {title}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {editing
                ? "Update the details shown in your course catalog."
                : "Add the essentials, outcomes, and images for your catalog."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close course form"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-800"
          >
            <i className="fa-solid fa-xmark" aria-hidden="true" />
          </button>
        </header>

        <ol
          aria-label="Course creation steps"
          className="grid grid-cols-3 gap-2"
        >
          {STEPS.map((label, index) => {
            const stepNumber = index + 1;
            const current = step === stepNumber;
            const complete = step > stepNumber;
            return (
              <li
                key={label}
                className={`flex items-center gap-2 border-b-2 pb-3 text-xs font-bold ${
                  current || complete
                    ? "border-brand-primary text-brand-primary"
                    : "border-slate-200 text-slate-400"
                }`}
                aria-current={current ? "step" : undefined}
              >
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                    current || complete
                      ? "bg-brand-primary text-white"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {complete ? (
                    <i className="fa-solid fa-check" aria-hidden="true" />
                  ) : (
                    stepNumber
                  )}
                </span>
                <span className="hidden sm:inline">{label}</span>
              </li>
            );
          })}
        </ol>

        <section
          className={`${step === 1 ? "block" : "hidden"} space-y-5`}
          aria-labelledby="category-step-title"
        >
            <div>
              <h3
                id="category-step-title"
                className="text-base font-bold text-brand-dark"
              >
                Start with a category
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Choose where learners will find this course, or create a new category.
              </p>
            </div>

            {categoriesLoading ? (
              <p className="flex items-center gap-2 rounded-xl bg-slate-50 p-4 text-sm text-slate-500" role="status">
                <i className="fa-solid fa-spinner animate-spin" aria-hidden="true" />
                Loading categories...
              </p>
            ) : (
              <>
                {categoriesError && (
                  <div
                    role="alert"
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
                  >
                    <span>{categoriesError}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setCategoriesError("");
                        setCategoriesLoading(true);
                        setCategoryRetry((retry) => retry + 1);
                      }}
                      className="font-bold underline underline-offset-2"
                    >
                      Retry
                    </button>
                  </div>
                )}
                <div className="grid gap-3 sm:grid-cols-2">
                  {categories.map((category) => {
                    const selectable = Boolean(category.id);
                    const selected = category.id === resolvedCategoryId;
                    return (
                      <button
                        key={category.id || category.name}
                        type="button"
                        disabled={!selectable}
                        onClick={() => {
                          setCategoryId(category.id);
                          setCategoriesError("");
                          setError("");
                        }}
                        className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition ${
                          selected
                            ? "border-brand-primary bg-brand-primary/[0.05] ring-2 ring-brand-primary/10"
                            : "border-slate-200 bg-white hover:border-brand-primary/40 hover:bg-slate-50"
                        } disabled:cursor-not-allowed disabled:opacity-50`}
                      >
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
                          <i className="fa-solid fa-layer-group" aria-hidden="true" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-bold text-brand-dark">
                            {category.name}
                          </span>
                          {!selectable && (
                            <span className="mt-0.5 block text-[11px] text-slate-500">
                              Category ID unavailable
                            </span>
                          )}
                        </span>
                        {selected && (
                          <i
                            className="fa-solid fa-circle-check text-brand-primary"
                            aria-hidden="true"
                          />
                        )}
                      </button>
                    );
                  })}
                  {categories.length === 0 && (
                    <p className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500 sm:col-span-2">
                      No categories yet. Create one to continue.
                    </p>
                  )}
                </div>
              </>
            )}

            {addingCategory ? (
              <div className="rounded-2xl border border-brand-primary/15 bg-brand-primary/[0.035] p-4">
                <label htmlFor="new-course-category" className={LABEL}>
                  New category name
                </label>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <input
                    id="new-course-category"
                    value={newCategoryName}
                    onChange={(event) => setNewCategoryName(event.target.value)}
                    maxLength={80}
                    placeholder="e.g. Data Science"
                    className={FIELD}
                    disabled={categorySubmitting}
                  />
                  <button
                    type="button"
                    onClick={handleCreateCategory}
                    disabled={categorySubmitting}
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-brand-primary px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-900 disabled:opacity-60"
                  >
                    {categorySubmitting ? (
                      <i className="fa-solid fa-spinner animate-spin" aria-hidden="true" />
                    ) : (
                      <i className="fa-solid fa-plus" aria-hidden="true" />
                    )}
                    Create category
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAddingCategory(false);
                      setCategoriesError("");
                    }}
                    disabled={categorySubmitting}
                    className="rounded-xl px-3 py-3 text-sm font-semibold text-slate-500 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setAddingCategory(true);
                  setCategoriesError("");
                }}
                className="inline-flex items-center gap-2 rounded-xl border border-dashed border-brand-primary/40 px-4 py-3 text-sm font-bold text-brand-primary transition hover:border-brand-primary hover:bg-brand-primary/[0.04]"
              >
                <i className="fa-solid fa-plus" aria-hidden="true" />
                Create a category
              </button>
            )}
        </section>

        <section
          className={`${step === 2 ? "block" : "hidden"} space-y-5`}
          aria-labelledby="details-step-title"
        >
            <div>
              <h3
                id="details-step-title"
                className="text-base font-bold text-brand-dark"
              >
                Course details
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                {selectedCategory?.name
                  ? `Filing under ${selectedCategory.name}.`
                  : "Add the information learners need before enrolling."}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="course-name" className={LABEL}>
                  Course name <span className="text-rose-500">*</span>
                </label>
                <input
                  id="course-name"
                  name="name"
                  data-details-field
                  required
                  maxLength={160}
                  defaultValue={editing?.title}
                  placeholder="e.g. Java Spring Boot"
                  className={FIELD}
                />
              </div>
              <div className="sm:col-span-2 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5">
                <div className="mb-4">
                  <h4 className="text-sm font-extrabold text-brand-dark">
                    Course descriptions
                  </h4>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Add the English description and its Arabic translation.
                    Both are saved in the course .
                  </p>
                </div>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="course-description" className={LABEL}>
                      English description{" "}
                      <code className="ml-1 rounded bg-white px-1.5 py-0.5 font-mono text-[11px] text-brand-primary">
                        description
                      </code>
                      <span className="ml-1 text-rose-500">*</span>
                    </label>
                    <textarea
                      id="course-description"
                      name="description"
                      data-details-field
                      required
                      minLength={10}
                      maxLength={3000}
                      rows={3}
                      value={description}
                      onChange={(event) => setDescription(event.target.value)}
                      placeholder="Describe what the course covers and who it is for..."
                      className={`${FIELD} resize-y`}
                    />
                  </div>
                  <div>
                    <label htmlFor="course-description-ar" className={LABEL}>
                      Arabic description{" "}
                      <code className="ml-1 rounded bg-white px-1.5 py-0.5 font-mono text-[11px] text-brand-primary">
                        descriptionAr
                      </code>
                      <span className="ml-1 font-medium text-slate-400">
                        (optional)
                      </span>
                    </label>
                    <textarea
                      id="course-description-ar"
                      name="descriptionAr"
                      lang="ar"
                      dir="rtl"
                      maxLength={3000}
                      rows={3}
                      value={descriptionAr}
                      onChange={(event) => setDescriptionAr(event.target.value)}
                      placeholder="اكتب وصف الدورة باللغة العربية..."
                      className={`${FIELD} resize-y text-right`}
                    />
                  </div>
                </div>
              </div>
              <div>
                <label htmlFor="course-price" className={LABEL}>
                  Price before discount <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
                    EGP
                  </span>
                  <input
                    id="course-price"
                    name="price"
                    data-details-field
                    type="number"
                    min="0"
                    step="any"
                    required
                    value={priceAmount}
                    onChange={(event) => setPriceAmount(event.target.value)}
                    placeholder="1500"
                    className={`${FIELD} pl-12`}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="course-discount" className={LABEL}>
                  Discount percentage
                </label>
                <div className="relative">
                  <input
                    id="course-discount"
                    name="discount"
                    data-details-field
                    type="number"
                    min="0"
                    max="100"
                    step="any"
                    value={discount}
                    onChange={(event) => setDiscount(event.target.value)}
                    placeholder="0"
                    className={`${FIELD} pr-9`}
                  />
                  <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                    <i className="fa-solid fa-percent" aria-hidden="true" />
                  </span>
                </div>
              </div>
              <div className="sm:col-span-2 rounded-xl bg-slate-50 px-4 py-3">
                <p className="text-xs font-bold text-slate-500">
                  Price preview · Discounted price is calculated from the
                  price and discount
                </p>
                <CoursePrice
                  price={priceAmount}
                  discount={discount}
                  className="mt-1 text-lg font-extrabold"
                  originalClassName="text-sm font-semibold text-slate-400 line-through"
                  discountClassName="text-xs font-bold text-rose-600"
                />
              </div>
              <div>
                <label htmlFor="course-duration-amount" className={LABEL}>
                  Duration <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
                  <input
                    id="course-duration-amount"
                    name="durationAmount"
                    data-details-field
                    type="number"
                    min="1"
                    step="1"
                    required
                    value={durationAmount}
                    onChange={(event) => setDurationAmount(event.target.value)}
                    placeholder="12"
                    className={FIELD}
                  />
                  <select
                    id="course-duration-unit"
                    name="durationUnit"
                    aria-label="Duration unit"
                    data-details-field
                    required
                    value={durationUnit}
                    onChange={(event) => setDurationUnit(event.target.value)}
                    className={`${FIELD} min-w-28`}
                  >
                    {DURATION_UNITS.map((unit) => (
                      <option key={unit} value={unit}>
                        {unit}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label htmlFor="course-level" className={LABEL}>
                  Course level <span className="text-rose-500">*</span>
                </label>
                <select
                  id="course-level"
                  name="level"
                  data-details-field
                  required
                  defaultValue={editing?.level || "BEGINNER"}
                  className={FIELD}
                >
                  {LEVELS.map((level) => (
                    <option key={level} value={level}>
                      {level === "ALLGRADES"
                        ? "All grades"
                        : level.charAt(0) + level.slice(1).toLowerCase()}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="course-status" className={LABEL}>
                  Publishing status <span className="text-rose-500">*</span>
                </label>
                <select
                  id="course-status"
                  name="status"
                  required
                  defaultValue={
                    editing?.status ||
                    (editing?.isActive === false ? "DRAFT" : "PUBLISH")
                  }
                  className={FIELD}
                >
                  {STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status === "PUBLISH" ? "Publish" : "Save as draft"}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-end justify-between gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-600">
                    What you will learn
                  </label>
                  <p className="mt-0.5 text-xs text-slate-400">
                    Add clear outcomes learners can expect.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setOutcomes((items) => [...items, ""])}
                  className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-bold text-brand-primary transition hover:bg-brand-primary/5"
                >
                  <i className="fa-solid fa-plus" aria-hidden="true" />
                  Add line
                </button>
              </div>
              <div className="space-y-2">
                {outcomes.map((outcome, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                      <i className="fa-solid fa-check" aria-hidden="true" />
                    </span>
                    <input
                      aria-label={`Learning outcome ${index + 1}`}
                      value={outcome}
                      onChange={(event) =>
                        setOutcomes((items) =>
                          items.map((item, itemIndex) =>
                            itemIndex === index ? event.target.value : item,
                          ),
                        )
                      }
                      maxLength={240}
                      placeholder={`Learning outcome ${index + 1}`}
                      className={FIELD}
                    />
                    <button
                      type="button"
                      aria-label={`Remove learning outcome ${index + 1}`}
                      disabled={outcomes.length === 1}
                      onClick={() =>
                        setOutcomes((items) =>
                          items.filter((_, itemIndex) => itemIndex !== index),
                        )
                      }
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      <i className="fa-solid fa-trash-can" aria-hidden="true" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
        </section>

        <section
          className={`${step === 3 ? "block" : "hidden"} space-y-5`}
          aria-labelledby="images-step-title"
        >
            <div>
              <h3
                id="images-step-title"
                className="text-base font-bold text-brand-dark"
              >
                Add course images
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Images are optional. Choose files from your device if you want
                to add or replace them.
              </p>
            </div>

            {[
              {
                id: "course-image-file",
                name: "Course cover",
                description: "Shown on course cards and course details.",
                file: courseImg,
                setFile: setCourseImg,
                clearSavedImage: clearCourseImg,
                setClearSavedImage: setClearCourseImg,
                existingImage:
                  editing?.courseImg || editing?.courseImage || editing?.image,
                inputRef: courseImgInputRef,
                icon: "fa-image",
              },
              {
                id: "roadmap-image-file",
                name: "Roadmap image",
                description: "Shows the learning roadmap for this course.",
                file: roadmapImg,
                setFile: setRoadmapImg,
                clearSavedImage: clearRoadmapImg,
                setClearSavedImage: setClearRoadmapImg,
                existingImage: editing?.roadmapImg || editing?.roadmapImage,
                inputRef: roadmapImgInputRef,
                icon: "fa-map",
              },
            ].map((image) => (
              <div
                key={image.id}
                className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-brand-primary/10 text-2xl text-brand-primary">
                    <i className={`fa-solid ${image.icon}`} aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-brand-dark">
                      {image.name}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {image.description}
                    </p>
                    {image.existingImage && !image.clearSavedImage && (
                      <p className="mt-1 text-xs text-slate-500">
                        An image is already saved for this course.
                      </p>
                    )}
                    {image.file ? (
                      <p className="mt-2 truncate text-xs font-semibold text-emerald-700">
                        <i className="fa-solid fa-circle-check mr-1.5" aria-hidden="true" />
                        {image.file.name}
                      </p>
                    ) : (
                      <p className="mt-2 text-xs text-slate-400">
                        {image.clearSavedImage
                          ? "The saved image will be removed when you save."
                          : "Optional · PNG, JPG, or WebP"}
                      </p>
                    )}
                    {image.file && (
                      <button
                        type="button"
                        onClick={() => {
                          image.setFile(null);
                          if (image.inputRef.current) {
                            image.inputRef.current.value = "";
                          }
                        }}
                        className="mt-2 block text-xs font-bold text-rose-600 underline underline-offset-2 hover:text-rose-700"
                      >
                        Remove selected upload
                      </button>
                    )}
                    {image.existingImage && !image.clearSavedImage && (
                      <button
                        type="button"
                        onClick={() => {
                          image.setClearSavedImage(true);
                          image.setFile(null);
                          if (image.inputRef.current) {
                            image.inputRef.current.value = "";
                          }
                        }}
                        className="mt-2 block text-xs font-bold text-rose-600 underline underline-offset-2 hover:text-rose-700"
                      >
                        Remove saved image
                      </button>
                    )}
                    {image.clearSavedImage && (
                      <button
                        type="button"
                        onClick={() => image.setClearSavedImage(false)}
                        className="mt-2 block text-xs font-bold text-brand-primary underline underline-offset-2 hover:text-blue-900"
                      >
                        Keep saved image
                      </button>
                    )}
                  </div>
                  <label
                    htmlFor={image.id}
                    className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 transition hover:border-brand-primary/40 hover:text-brand-primary"
                  >
                    <i className="fa-solid fa-arrow-up-from-bracket" aria-hidden="true" />
                    {image.file ? "Change image" : "Choose image"}
                  </label>
                  <input
                    id={image.id}
                    ref={image.inputRef}
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(event) => {
                      const file = event.target.files?.[0] || null;
                      image.setFile(file);
                      if (file) image.setClearSavedImage(false);
                    }}
                  />
                </div>
              </div>
            ))}
        </section>

        {error && (
          <p
            role="alert"
            className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700"
          >
            {error}
          </p>
        )}

        <footer className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 disabled:opacity-50"
          >
            Cancel
          </button>
          <div className="flex flex-col-reverse gap-2 sm:flex-row">
            {step > 1 && (
              <button
                type="button"
                onClick={() => {
                  setError("");
                  setStep((current) => current - 1);
                }}
                disabled={saving}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
              >
                <i className="fa-solid fa-arrow-left mr-2" aria-hidden="true" />
                Back
              </button>
            )}
            {step < STEPS.length ? (
              <button
                type="submit"
                disabled={
                  (step === 1 &&
                    (categoriesLoading ||
                      (Boolean(categoriesError) && !resolvedCategoryId))) ||
                  saving
                }
                className="rounded-xl bg-brand-primary px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Continue
                <i className="fa-solid fa-arrow-right ml-2" aria-hidden="true" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-primary px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-900 disabled:cursor-wait disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <i className="fa-solid fa-spinner animate-spin" aria-hidden="true" />
                    Saving course...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-floppy-disk" aria-hidden="true" />
                    Save course
                  </>
                )}
              </button>
            )}
          </div>
        </footer>
      </form>
  );
}
