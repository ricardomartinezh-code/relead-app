import { redirect } from "next/navigation";

export default function PrivacyRedirect() {
  return redirect("/dashboard/legal/privacy");
}
