import { redirect } from "next/navigation";

export default function TermsRedirect() {
  return redirect("/dashboard/legal/terms");
}
