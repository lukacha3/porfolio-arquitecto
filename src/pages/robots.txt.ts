import type { APIRoute } from "astro";

export const GET: APIRoute = ({ site }) => {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  const adminPath = base ? `${base}/admin/` : "/admin/";
  const sitemapUrl = site
    ? new URL(`${base}/sitemap-index.xml`, site).href
    : `${base}/sitemap-index.xml`;

  const lines = [
    "User-agent: *",
    "Allow: /",
    `Disallow: ${adminPath}`,
    ...(base ? ["Disallow: /admin/"] : []),
    "",
    `Sitemap: ${sitemapUrl}`,
    "",
  ];

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
};
