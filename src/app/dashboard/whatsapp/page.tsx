import Link from "next/link";

import { DashboardLayout } from "@/components/DashboardLayout";
import { getSession } from "@/lib/auth";
import { getUserById } from "@/lib/db";
import { Button } from "@/components/ui/button";

import WhatsappEmbeddedSignup from "./WhatsappEmbeddedSignup";
// Import the MetaSdkProvider to wrap components that call `useMetaSdk`.
import { MetaSdkProvider } from "@/app/providers/MetaSdkProvider";
import WhatsappTestMessagePanel from "./WhatsappTestMessagePanel";

export default async function WhatsappPage() {
  return (
    <DashboardLayout>
      <div className="rounded-2xl bg-white p-6 text-sm text-slate-700 shadow-sm ring-1 ring-slate-200">
        Esta sección fue movida a <Link className="text-indigo-600 underline" href="/dashboard/waba">WABA</Link>.
      </div>
    </DashboardLayout>
  );
}
