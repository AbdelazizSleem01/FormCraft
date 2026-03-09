import { redirect } from "next/navigation";
import { getCurrentUserFromCookies } from "@/lib/auth";

export default function Home() {
  const user = getCurrentUserFromCookies();
  redirect(user ? "/dashboard" : "/login");
}
