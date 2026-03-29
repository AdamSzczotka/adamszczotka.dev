import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

const ADMIN_EMAILS = ["adam.szczotka0@gmail.com"];

export async function requireAdmin() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !ADMIN_EMAILS.includes(session.user.email)) {
    redirect("/admin/login");
  }

  return session;
}
