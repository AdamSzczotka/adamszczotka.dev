import { redirect } from "next/navigation";

// /admin itself has no screen; the panel starts at the dashboard.
export default function AdminIndexPage() {
  redirect("/admin/dashboard");
}
