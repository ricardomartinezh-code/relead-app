import Link from "next/link";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
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
            Conecta WhatsApp Business y gestiona tus CTA desde un solo lugar.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {/* WhatsApp Business card */}
          <Card className="shadow-sm">
            <CardHeader className="space-y-1">
              <CardTitle className="text-lg">WhatsApp Business</CardTitle>
              <CardDescription>
                Configura mensajes de prueba, webhooks y obtén tus identificadores de negocio.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/dashboard/whatsapp">Conectar WhatsApp</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Placeholder for future channels */}
          <Card className="shadow-sm">
            <CardHeader className="space-y-1">
              <CardTitle className="text-lg">Próximamente</CardTitle>
              <CardDescription>
                Más canales de captación estarán disponibles pronto.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center">
              <Badge variant="outline">Beta</Badge>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}