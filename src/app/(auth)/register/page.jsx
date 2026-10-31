import AuthPage from "@/features/auth/components/AuthPage";

export const metadata = { title: "Create your account" };

export default function RegisterPage() {
  return <AuthPage mode="register" />;
}
