import { createFileRoute } from "@tanstack/react-router";
import { planBuild } from "@/lib/fox/copilot";

export const Route = createFileRoute("/api/copilot")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let prompt = "";
        try {
          const body = (await request.json()) as { prompt?: string };
          prompt = String(body.prompt ?? "");
        } catch {
          prompt = "";
        }
        return Response.json(planBuild(prompt));
      },
    },
  },
});
