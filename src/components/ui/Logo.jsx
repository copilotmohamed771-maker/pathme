import Link from "next/link";
import Image from "next/image";

export function LogoMark({ className = "w-6 h-6" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 19C4 19 6 12 12 12C18 12 20 5 20 5"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx="4" cy="19" r="2.5" fill="#16B8A6" />
      <circle cx="12" cy="12" r="2.5" fill="#FF9F43" />
      <circle cx="20" cy="5" r="2.5" fill="#ffffff" />
    </svg>
  );
}

export function Logo({ variant = "light", size = "md", showTagline = false }) {
  const box = size === "md" ? "w-10 h-10 shadow-md shadow-brand-primary/20" : "w-9 h-9";
  const icon = size === "md" ? "w-6 h-6" : "w-5 h-5";

  return (
    <Link
      href="/"
      className="flex items-center gap-3"
      aria-label="PathMe home"
    >
      {variant === "light" ? (
        <div>
          <Image
            src="/images/pathme-logo.png"
            alt=""
            width={605}
            height={159}
            priority
            className={size === "md" ? "h-12 w-[182px]" : "h-10 w-[152px]"}
          />
          {showTagline && (
            <span className="hidden text-[10px] font-bold uppercase tracking-widest text-gray-400 sm:block">
              LEARN / BUILD / APPLY
            </span>
          )}
        </div>
      ) : (
        <>
          <div
            className={`${box} flex items-center justify-center rounded-xl bg-brand-primary text-white`}
          >
            <LogoMark className={icon} />
          </div>
          <div>
            <span className="text-2xl font-extrabold tracking-tight text-white">
              Path<span className="text-brand-innovation">Me</span>
            </span>
            {showTagline && (
              <span className="hidden text-[10px] font-bold uppercase tracking-widest text-gray-400 sm:block">
                LEARN / BUILD / APPLY
              </span>
            )}
          </div>
        </>
      )}
    </Link>
  );
}
