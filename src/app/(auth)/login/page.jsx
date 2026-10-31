import { Suspense } from "react";
import AuthPage from "@/features/auth/components/AuthPage";

export const metadata = { title: "Log in" };

export default function LoginPage({ searchParams }) {
  return (
    <Suspense fallback={<AuthPage mode="login" />}>
      <LoginContent searchParams={searchParams} />
    </Suspense>
  );
}

async function LoginContent({ searchParams }) {
  const params = await searchParams;
  return (
    <AuthPage
      mode="login"
      initialForgotOpen={params?.forgot === "1"}
    />
  );
}
