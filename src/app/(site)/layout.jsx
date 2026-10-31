import { Suspense } from "react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Toaster } from "@/components/ui/Toaster";
import { LanguageProvider } from "@/lib/language";

export default function SiteLayout({ children }) {
  return (
    <LanguageProvider>
      <div className="site-shell relative isolate flex min-h-screen flex-col justify-between">
        <div className="site-ambient" aria-hidden="true">
          <div className="site-ambient-wave site-ambient-wave-primary" />
          <div className="site-ambient-wave site-ambient-wave-secondary" />
          <div className="site-ambient-object site-ambient-object-top">
            <span className="site-ambient-orb site-ambient-orb-teal" />
            <span className="site-ambient-ring site-ambient-ring-blue" />
            <span className="site-ambient-orb site-ambient-orb-orange" />
          </div>
          <div className="site-ambient-object site-ambient-object-bottom">
            <span className="site-ambient-orb site-ambient-orb-blue" />
            <span className="site-ambient-ring site-ambient-ring-teal" />
          </div>
        </div>
        <div className="relative z-10 flex min-h-screen flex-col justify-between">
          <Suspense fallback={<div className="h-20 bg-white" aria-hidden="true" />}>
            <SiteHeader />
          </Suspense>
          <main className="flex-grow">{children}</main>
          <SiteFooter />
          <Toaster />
        </div>
      </div>
    </LanguageProvider>
  );
}
