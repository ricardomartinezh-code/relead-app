"use client";

import { type LinkRecord } from "@/lib/mockDb";

export function LinkButtons({ links }: { links: LinkRecord[] }) {
  const handleClick = async (link: LinkRecord) => {
    try {
      await fetch("/api/track/link-click", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ linkId: link.id }),
      });
    } catch (e) {
      console.error(e);
    }
    window.location.href = link.url;
  };

  return (
    <div className="w-full space-y-3">
      {links.map((link) => (
        <a
          key={link.id}
          href={link.url}
          onClick={(event) => {
            event.preventDefault();
            void handleClick(link);
          }}
          className="w-full rounded-xl bg-slate-800/70 px-4 py-3 text-center text-sm font-medium text-slate-100 shadow-sm transition-transform hover:-translate-y-[1px] hover:bg-slate-700"
          target="_blank"
          rel="noopener noreferrer"
        >
          {link.label}
        </a>
      ))}
    </div>
  );
}
