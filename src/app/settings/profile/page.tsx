import { redirect } from "next/navigation";

export default function SettingsProfileRedirect() {
  return redirect("/dashboard/settings/profile");
}
