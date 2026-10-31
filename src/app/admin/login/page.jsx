import { AdminLoginPage } from "@/features/admin/components/AdminLoginPage";

export const metadata = {
  title: "Admin sign in",
  robots: { index: false, follow: false },
};

export default function AdminLoginRoute() {
  return <AdminLoginPage />;
}
