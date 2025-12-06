import { redirect } from "next/navigation";

export default function LegacyLinksRedirect() {
  return redirect("/dashboard/link-pages");
}
