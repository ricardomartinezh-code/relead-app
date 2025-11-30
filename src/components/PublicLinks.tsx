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
        <button
          key={link.id}
          onClick={() => handleClick(link)}
          className="flex w-full items-center justify-center rounded-lg bg-white px-4 py-3 text-lg font-semibold text-gray-900 shadow hover:-translate-y-0.5 hover:shadow-lg transition"
        >
          {link.label}
        </button>
      ))}
    </div>
  );
}
