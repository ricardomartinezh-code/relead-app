import { sql } from "@/lib/db/client";

export type AnalyticsResponse = {
  totals: { views: number; clicks: number; ctr: number };
  topLink: { type: "link" | "item"; id: string; label: string; clicks: number } | null;
  series: Array<{ day: string; views: number; clicks: number }>;
  lastUpdated: string;
  demo?: boolean;
};

type DayPoint = { day: string; views: number; clicks: number };

function formatDay(date: Date) {
  return date.toISOString().slice(0, 10);
}

function buildLastDays(days: number) {
  const result: string[] = [];
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  for (let i = days - 1; i >= 0; i -= 1) {
    const d = new Date(today);
    d.setUTCDate(today.getUTCDate() - i);
    result.push(formatDay(d));
  }
  return result;
}

export async function getAnalyticsOverviewForClerkUserId(
  clerkUserId: string
): Promise<AnalyticsResponse> {
  if (!process.env.DATABASE_URL) {
    const days = buildLastDays(7);
    return {
      totals: { views: 0, clicks: 0, ctr: 0 },
      topLink: null,
      series: days.map((day) => ({ day, views: 0, clicks: 0 })),
      lastUpdated: new Date().toISOString(),
      demo: true,
    };
  }

  const userRows =
    await sql/*sql*/`SELECT id, profile_id FROM users WHERE clerk_id = ${clerkUserId} LIMIT 1`;
  if (!userRows.length) {
    throw new Error("Usuario no encontrado en base de datos");
  }

  const dbUserId = userRows[0].id as string;
  const profileId = userRows[0].profile_id as string | null;
  if (!profileId) {
    throw new Error("Perfil no encontrado");
  }

  const days = buildLastDays(7);
  const since = new Date();
  since.setUTCDate(since.getUTCDate() - 6);
  since.setUTCHours(0, 0, 0, 0);

  const [viewsTotalRows, linkClicksTotalRows] = await Promise.all([
    sql/*sql*/`SELECT COUNT(*)::int AS count FROM page_views WHERE profile_id = ${profileId}`,
    sql/*sql*/`
      SELECT COUNT(*)::int AS count
      FROM link_clicks lc
      JOIN links l ON l.id = lc.link_id
      WHERE l.profile_id = ${profileId}
    `,
  ]);

  let itemClicksTotal = 0;
  try {
    const itemClicksTotalRows = await sql/*sql*/`
      SELECT COUNT(*)::int AS count
      FROM link_item_clicks lic
      JOIN link_items li ON li.id = lic.item_id
      JOIN link_blocks lb ON lb.id = li.block_id
      JOIN link_pages lp ON lp.id = lb.page_id
      WHERE lp.user_id = ${dbUserId}
    `;
    itemClicksTotal = (itemClicksTotalRows[0]?.count as number) ?? 0;
  } catch {
    itemClicksTotal = 0;
  }

  const viewsTotal = (viewsTotalRows[0]?.count as number) ?? 0;
  const linkClicksTotal = (linkClicksTotalRows[0]?.count as number) ?? 0;
  const clicksTotal = linkClicksTotal + itemClicksTotal;
  const ctr = viewsTotal > 0 ? clicksTotal / viewsTotal : 0;

  const viewSeriesRows = await sql/*sql*/`
    SELECT to_char(date_trunc('day', created_at), 'YYYY-MM-DD') AS day, COUNT(*)::int AS views
    FROM page_views
    WHERE profile_id = ${profileId} AND created_at >= ${since.toISOString()}::timestamptz
    GROUP BY 1
    ORDER BY 1
  `;

  const linkClickSeriesRows = await sql/*sql*/`
    SELECT to_char(date_trunc('day', lc.created_at), 'YYYY-MM-DD') AS day, COUNT(*)::int AS clicks
    FROM link_clicks lc
    JOIN links l ON l.id = lc.link_id
    WHERE l.profile_id = ${profileId} AND lc.created_at >= ${since.toISOString()}::timestamptz
    GROUP BY 1
    ORDER BY 1
  `;

  let itemClickSeriesRows: Array<{ day: string; clicks: number }> = [];
  try {
    itemClickSeriesRows = (await sql/*sql*/`
      SELECT to_char(date_trunc('day', lic.created_at), 'YYYY-MM-DD') AS day, COUNT(*)::int AS clicks
      FROM link_item_clicks lic
      JOIN link_items li ON li.id = lic.item_id
      JOIN link_blocks lb ON lb.id = li.block_id
      JOIN link_pages lp ON lp.id = lb.page_id
      WHERE lp.user_id = ${dbUserId} AND lic.created_at >= ${since.toISOString()}::timestamptz
      GROUP BY 1
      ORDER BY 1
    `) as any;
  } catch {
    itemClickSeriesRows = [];
  }

  const viewsByDay = new Map<string, number>(
    (viewSeriesRows as any[]).map((r) => [String(r.day), Number(r.views)])
  );
  const clicksByDay = new Map<string, number>(
    (linkClickSeriesRows as any[]).map((r) => [String(r.day), Number(r.clicks)])
  );
  for (const row of itemClickSeriesRows as any[]) {
    const day = String(row.day);
    clicksByDay.set(day, (clicksByDay.get(day) ?? 0) + Number(row.clicks));
  }

  const series: DayPoint[] = days.map((day) => ({
    day,
    views: viewsByDay.get(day) ?? 0,
    clicks: clicksByDay.get(day) ?? 0,
  }));

  const topLinkRows = await sql/*sql*/`
    SELECT l.id AS id, l.label AS label, COUNT(*)::int AS clicks
    FROM link_clicks lc
    JOIN links l ON l.id = lc.link_id
    WHERE l.profile_id = ${profileId}
    GROUP BY l.id, l.label
    ORDER BY clicks DESC
    LIMIT 1
  `;

  let topItemRows: any[] = [];
  try {
    topItemRows = (await sql/*sql*/`
      SELECT li.id AS id, li.label AS label, COUNT(*)::int AS clicks
      FROM link_item_clicks lic
      JOIN link_items li ON li.id = lic.item_id
      JOIN link_blocks lb ON lb.id = li.block_id
      JOIN link_pages lp ON lp.id = lb.page_id
      WHERE lp.user_id = ${dbUserId}
      GROUP BY li.id, li.label
      ORDER BY clicks DESC
      LIMIT 1
    `) as any;
  } catch {
    topItemRows = [];
  }

  const topLinkCandidate = topLinkRows[0]
    ? {
        type: "link" as const,
        id: String((topLinkRows as any[])[0].id),
        label: String((topLinkRows as any[])[0].label),
        clicks: Number((topLinkRows as any[])[0].clicks),
      }
    : null;

  const topItemCandidate = topItemRows[0]
    ? {
        type: "item" as const,
        id: String((topItemRows as any[])[0].id),
        label: String((topItemRows as any[])[0].label),
        clicks: Number((topItemRows as any[])[0].clicks),
      }
    : null;

  const topLink =
    topItemCandidate && (!topLinkCandidate || topItemCandidate.clicks >= topLinkCandidate.clicks)
      ? topItemCandidate
      : topLinkCandidate;

  return {
    totals: {
      views: viewsTotal,
      clicks: clicksTotal,
      ctr,
    },
    topLink,
    series,
    lastUpdated: new Date().toISOString(),
  };
}

