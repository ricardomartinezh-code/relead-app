"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Activity, ArrowUpRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type AnalyticsResponse = {
  totals: { views: number; clicks: number; ctr: number };
  topLink: { type: "link" | "item"; id: string; label: string; clicks: number } | null;
  series: Array<{ day: string; views: number; clicks: number }>;
  breakdown: {
    devices: Array<{ label: string; count: number }>;
    referrers: Array<{ label: string; count: number }>;
  };
  profile?: { slug: string; title: string | null };
  lastUpdated: string;
  demo?: boolean;
};

function formatCompactNumber(value: number) {
  return new Intl.NumberFormat("es-MX", { notation: "compact" }).format(value);
}

function formatPercent(value: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "percent",
    maximumFractionDigits: 1,
  }).format(value);
}

function formatSourceLabel(raw: string) {
  const value = String(raw || "").trim().toLowerCase();
  if (!value || value === "direct" || value === "(direct)") return "Directo";
  return value;
}

function formatDeviceLabel(raw: string) {
  const value = String(raw || "").trim().toLowerCase();
  if (value === "mobile") return "Móvil";
  if (value === "tablet") return "Tablet";
  return "Escritorio";
}

function buildBarWidth(count: number, total: number) {
  if (!total) return "0%";
  const pct = Math.max(0, Math.min(1, count / total));
  return `${Math.round(pct * 100)}%`;
}

function buildPolyline(
  values: number[],
  width: number,
  height: number,
  padding: number
) {
  const max = Math.max(1, ...values);
  const stepX = values.length > 1 ? (width - padding * 2) / (values.length - 1) : 0;
  return values
    .map((v, i) => {
      const x = padding + i * stepX;
      const y = height - padding - (v / max) * (height - padding * 2);
      return `${x},${y}`;
    })
    .join(" ");
}

export default function AnalyticsOverview() {
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connection, setConnection] = useState<"connecting" | "live" | "polling">(
    "connecting"
  );

  useEffect(() => {
    let isMounted = true;
    let pollId: number | null = null;

    const fetchData = async () => {
      try {
        setError(null);
        const res = await fetch("/api/analytics/overview", { cache: "no-store" });
        const json = (await res.json()) as AnalyticsResponse & { error?: string };
        if (!res.ok) {
          throw new Error(json.error || "No se pudieron cargar las analíticas.");
        }
        if (isMounted) setData(json);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Error cargando analíticas";
        if (isMounted) setError(message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    const startPolling = () => {
      if (!isMounted) return null as any;
      setConnection("polling");
      void fetchData();
      if (pollId) return pollId;
      pollId = window.setInterval(fetchData, 5000);
      return pollId;
    };

    if (typeof window !== "undefined" && "EventSource" in window) {
      setConnection("connecting");
      const es = new EventSource("/api/analytics/stream");

      const onSnapshot = (event: MessageEvent) => {
        try {
          const json = JSON.parse(event.data) as AnalyticsResponse;
          if (isMounted) {
            setError(null);
            setData(json);
            setLoading(false);
            setConnection("live");
          }
        } catch {
          // ignore
        }
      };

      const onError = () => {
        es.close();
        startPolling();
      };

      es.addEventListener("snapshot", onSnapshot as any);
      es.addEventListener("error", onError as any);
      es.onerror = onError;

      return () => {
        isMounted = false;
        if (pollId) window.clearInterval(pollId);
        es.close();
      };
    }

    const id = startPolling();
    return () => {
      isMounted = false;
      if (id) window.clearInterval(id);
    };
  }, []);

  const series = useMemo(() => data?.series ?? [], [data?.series]);
  const views = useMemo(() => series.map((p) => p.views), [series]);
  const clicks = useMemo(() => series.map((p) => p.clicks), [series]);
  const viewsLine = useMemo(() => buildPolyline(views, 520, 120, 12), [views]);
  const clicksLine = useMemo(() => buildPolyline(clicks, 520, 120, 12), [clicks]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Activity className="h-3.5 w-3.5" />
        Cargando analíticas…
      </div>
    );
  }

  if (error) {
    return <p className="text-sm text-red-600">{error}</p>;
  }

  if (!data) return null;

  const devices = data.breakdown?.devices ?? [];
  const referrers = data.breakdown?.referrers ?? [];
  const totalDeviceViews = devices.reduce((sum, d) => sum + (d.count || 0), 0);
  const totalRefViews = referrers.reduce((sum, r) => sum + (r.count || 0), 0);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Activity className="h-3.5 w-3.5" />
          Analytics{" "}
          {data.demo
            ? "(demo)"
            : connection === "live"
            ? "en vivo"
            : connection === "polling"
            ? "actualizando"
            : "conectando"}
        </span>
        <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
          Actualizado: {new Date(data.lastUpdated).toLocaleTimeString("es-MX")}
        </span>
      </div>

      <Tabs defaultValue="evolucion">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="evolucion">Evolución</TabsTrigger>
          <TabsTrigger value="origen">Origen y dispositivos</TabsTrigger>
          <TabsTrigger value="acciones">Acciones rápidas</TabsTrigger>
        </TabsList>

        <TabsContent value="evolucion" className="animate-in fade-in-0 slide-in-from-top-1 duration-200">
          <div className="h-28 w-full rounded-xl border border-border bg-background p-2">
            <svg
              viewBox="0 0 520 120"
              className="h-full w-full"
              role="img"
              aria-label="Serie de vistas y clics (últimos 7 días)"
            >
              <polyline
                points={viewsLine}
                fill="none"
                style={{ stroke: "hsl(var(--foreground))" }}
                strokeWidth="2"
                strokeOpacity="0.7"
              />
              <polyline
                points={clicksLine}
                fill="none"
                style={{ stroke: "hsl(var(--primary))" }}
                strokeWidth="2"
                strokeOpacity="0.9"
              />
            </svg>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs text-muted-foreground">
            <div className="rounded-lg border border-border bg-muted/40 py-2">
              <p className="text-sm font-semibold text-foreground">
                {formatCompactNumber(data.totals.clicks)}
              </p>
              <p>Clics</p>
            </div>
            <div className="rounded-lg border border-border bg-muted/40 py-2">
              <p className="text-sm font-semibold text-foreground">
                {formatPercent(data.totals.ctr)}
              </p>
              <p>CTR</p>
            </div>
            <div className="rounded-lg border border-border bg-muted/40 py-2">
              <p className="text-sm font-semibold text-foreground">
                {data.topLink ? data.topLink.label : "—"}
              </p>
              <p>Top enlace</p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="origen" className="animate-in fade-in-0 slide-in-from-top-1 duration-200">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-border bg-card p-3">
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Dispositivos (vistas)
              </div>
              <div className="mt-2 space-y-2">
                {devices.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Aún no hay datos.</p>
                ) : (
                  devices.map((d) => (
                    <div key={d.label} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-foreground">
                          {formatDeviceLabel(d.label)}
                        </span>
                        <span className="text-muted-foreground">{formatCompactNumber(d.count)}</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted">
                        <div
                          className="h-2 rounded-full bg-foreground"
                          style={{ width: buildBarWidth(d.count, totalDeviceViews) }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-3">
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Origen (referrer)
              </div>
              <div className="mt-2 space-y-2">
                {referrers.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Aún no hay datos.</p>
                ) : (
                  referrers.map((r) => (
                    <div key={r.label} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-foreground">
                          {formatSourceLabel(r.label)}
                        </span>
                        <span className="text-muted-foreground">{formatCompactNumber(r.count)}</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted">
                        <div
                          className="h-2 rounded-full bg-primary"
                          style={{ width: buildBarWidth(r.count, totalRefViews) }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="acciones" className="animate-in fade-in-0 slide-in-from-top-1 duration-200">
          <div className="grid gap-3 sm:grid-cols-2">
            <Button asChild variant="outline" className="justify-between">
              <Link href="/dashboard/link-pages">
                Editar páginas
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="justify-between">
              <Link href="/dashboard/waba">
                Conectar WABA
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="justify-between">
              <Link href="/dashboard/settings">
                Ajustes
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
            {data.profile?.slug ? (
              <Button asChild className="justify-between">
                <a href={`/${data.profile.slug}`} target="_blank" rel="noreferrer">
                  Ver página pública
                  <Sparkles className="h-4 w-4" />
                </a>
              </Button>
            ) : null}
          </div>

          {data.topLink ? (
            <div className="mt-3 rounded-xl border border-border bg-muted/40 p-3 text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">Top enlace:</span>{" "}
              {data.topLink.label} · {formatCompactNumber(data.topLink.clicks)} clics
            </div>
          ) : null}
        </TabsContent>
      </Tabs>
    </div>
  );
}
