"use client";

import { useEffect, useMemo, useState } from "react";
import { Activity } from "lucide-react";

type AnalyticsResponse = {
  totals: { views: number; clicks: number; ctr: number };
  topLink: { type: "link" | "item"; id: string; label: string; clicks: number } | null;
  series: Array<{ day: string; views: number; clicks: number }>;
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
      <div className="flex items-center gap-2 text-xs text-slate-600">
        <Activity className="h-3.5 w-3.5" />
        Cargando analíticas…
      </div>
    );
  }

  if (error) {
    return <p className="text-sm text-red-600">{error}</p>;
  }

  if (!data) return null;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
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
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-700">
          Actualizado: {new Date(data.lastUpdated).toLocaleTimeString("es-MX")}
        </span>
      </div>

      <div className="h-28 w-full rounded-xl bg-gradient-to-b from-slate-50 to-white p-2">
        <svg
          viewBox="0 0 520 120"
          className="h-full w-full"
          role="img"
          aria-label="Serie de vistas y clics (últimos 7 días)"
        >
          <polyline
            points={viewsLine}
            fill="none"
            stroke="rgb(15 23 42)"
            strokeWidth="2"
            strokeOpacity="0.8"
          />
          <polyline
            points={clicksLine}
            fill="none"
            stroke="rgb(16 185 129)"
            strokeWidth="2"
            strokeOpacity="0.9"
          />
        </svg>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center text-xs text-slate-600">
        <div className="rounded-lg border border-slate-200 bg-slate-50 py-2">
          <p className="text-sm font-semibold text-slate-900">
            {formatCompactNumber(data.totals.clicks)}
          </p>
          <p>Clics</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 py-2">
          <p className="text-sm font-semibold text-slate-900">
            {formatPercent(data.totals.ctr)}
          </p>
          <p>CTR</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 py-2">
          <p className="text-sm font-semibold text-slate-900">
            {data.topLink ? data.topLink.label : "—"}
          </p>
          <p>Top enlace</p>
        </div>
      </div>
    </div>
  );
}
