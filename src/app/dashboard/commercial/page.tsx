import Link from "next/link";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function CommercialPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Comercial
          </p>
          <h1 className="text-3xl font-semibold text-slate-900">Canales y captación</h1>
          <p className="text-sm text-slate-600">
            Conecta WhatsApp Business y gestiona tus CTA desde un solo lugar.  Puedes añadir la
            integración con CTWA (Click To WhatsApp) o sin CTWA según tus necesidades.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {/* Integración con WhatsApp con y sin CTWA */}
          <Card className="shadow-sm">
            <CardHeader className="space-y-1">
              <CardTitle className="text-lg">WhatsApp con CTWA</CardTitle>
              <CardDescription>
                Utiliza el flujo oficial de Meta con Click&nbsp;To&nbsp;WhatsApp para que tus
                clientes puedan iniciar una conversación desde tus enlaces.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                {/* Pasamos un parámetro de consulta para indicar el modo CTWA */}
                <Link href="/dashboard/whatsapp?ctwa=true">Añadir WhatsApp con CTWA</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="space-y-1">
              <CardTitle className="text-lg">WhatsApp sin CTWA</CardTitle>
              <CardDescription>
                Integra WhatsApp Business sin el componente CTWA para campañas que no requieran el botón
                personalizado.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/dashboard/whatsapp?ctwa=false">Añadir WhatsApp sin CTWA</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}