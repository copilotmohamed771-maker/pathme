"use client";

import { useId, useState } from "react";
import { useLanguage } from "@/lib/language";

const DESCRIPTION_COLLAPSE_LENGTH = 240;

export function ExpandableDescription({ text, className = "" }) {
  const { t } = useLanguage();
  const descriptionId = useId();
  const [expanded, setExpanded] = useState(false);
  const canExpand = text.length > DESCRIPTION_COLLAPSE_LENGTH;

  return (
    <div>
      <p
        id={descriptionId}
        className={`${className} ${canExpand && !expanded ? "line-clamp-4" : ""}`}
      >
        {text}
      </p>
      {canExpand && (
        <button
          type="button"
          aria-expanded={expanded}
          aria-controls={descriptionId}
          onClick={() => setExpanded((current) => !current)}
          className="mt-2 inline-flex items-center gap-1.5 rounded-lg text-sm font-bold text-current underline decoration-current/40 underline-offset-4 transition hover:decoration-current focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current"
        >
          {t(expanded ? "Read less" : "Read more")}
          <i
            className={`fa-solid ${expanded ? "fa-chevron-up" : "fa-chevron-down"} text-[10px]`}
            aria-hidden="true"
          />
        </button>
      )}
    </div>
  );
}
