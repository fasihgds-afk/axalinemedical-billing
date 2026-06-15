import { redirect } from "next/navigation";

/** Auth routing is handled in proxy.js; keep home as a fast fallback redirect */
export default function HomePage() {
  redirect("/login");
}
