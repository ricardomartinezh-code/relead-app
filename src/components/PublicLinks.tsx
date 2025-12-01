"use client";

import { Link as LinkModel } from "@prisma/client";

export function LinkButtons({ links }: { links: LinkModel[] }) {
  const handleClick = async (link: LinkModel) => {
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
    <div className="space-y-3">
      {links.map((link) => (
        <a
          key={link.id}
          href={link.url}
          onClick={(event) => {
            event.preventDefault();
            void handleClick(link);
          }}
          className="block w-full rounded-full bg-white text-slate-900 text-sm font-medium px-4 py-3 text-center shadow-md hover:shadow-lg hover:scale-[1.01] transition"
        >
          {link.label}
        </a>
      ))}
    </div>
  );
}
