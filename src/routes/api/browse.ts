import { createFileRoute } from "@tanstack/react-router";

const PRIVATE_HOST =
  /^(localhost|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|0\.|169\.254\.|\[::1\]|metadata|internal)/i;

export const Route = createFileRoute("/api/browse")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const target = new URL(request.url).searchParams.get("url");
        if (!target) return new Response("url required", { status: 400 });
        let parsed: URL;
        try {
          parsed = new URL(target);
        } catch {
          return new Response("bad url", { status: 400 });
        }
        if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
          return new Response("http only", { status: 400 });
        }
        if (PRIVATE_HOST.test(parsed.hostname)) return new Response("blocked host", { status: 403 });

        const upstream = await fetch(parsed.href, {
          redirect: "follow",
          headers: {
            "user-agent": "Mozilla/5.0 FOX-OS",
            accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          },
        });
        const type = upstream.headers.get("content-type") ?? "text/html";
        if (!type.includes("text/html")) {
          const buf = await upstream.arrayBuffer();
          return new Response(buf.slice(0, 2_000_000), {
            status: upstream.status,
            headers: { "content-type": type, "cache-control": "no-store" },
          });
        }

        let html = (await upstream.text()).slice(0, 1_500_000);
        html = html.replace(/<meta[^>]+http-equiv=["']content-security-policy["'][^>]*>/gi, "");
        const base = `<base href="${parsed.href}">`;
        const hook = `<script>
document.addEventListener("click", function (event) {
  var node = event.target && event.target.closest ? event.target.closest("a") : null;
  if (!node || !node.href || node.target === "_blank") return;
  event.preventDefault();
  location.href = "/api/browse?url=" + encodeURIComponent(node.href);
});
</script>`;
        html = /<head[^>]*>/i.test(html)
          ? html.replace(/<head[^>]*>/i, (open) => `${open}${base}${hook}`)
          : `${base}${hook}${html}`;

        return new Response(html, {
          status: upstream.status,
          headers: {
            "content-type": "text/html; charset=utf-8",
            "cache-control": "no-store",
          },
        });
      },
    },
  },
});
