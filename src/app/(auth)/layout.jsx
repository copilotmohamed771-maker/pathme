import { GoogleAuthProvider } from "@/components/auth/GoogleAuthProvider";
import { LanguageProvider } from "@/lib/language";
import { AuthLayoutHeader } from "@/components/layout/AuthLayoutHeader";

export default function AuthLayout({ children }) {
  return (
    <LanguageProvider>
      <GoogleAuthProvider>
        <main className="relative isolate min-h-screen overflow-hidden bg-brand-light px-4 py-6 sm:px-6 sm:py-8">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-40 -top-48 h-[34rem] w-[34rem] rounded-full bg-brand-innovation/10 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-52 -left-40 h-[32rem] w-[32rem] rounded-full bg-brand-energy/10 blur-3xl"
          />
          <AuthLayoutHeader />
          <div className="mx-auto flex min-h-[calc(100vh-8rem)] w-full max-w-6xl items-center justify-center py-8 sm:py-12">
            {children}
          </div>
        </main>
      </GoogleAuthProvider>
    </LanguageProvider>
  );
}
