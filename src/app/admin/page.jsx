import { AdminAccess } from "@/features/admin/components/AdminAccess";

export const metadata = {
  title: "Admin Dashboard",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return <AdminAccess />;
}
