import { createFileRoute } from "@tanstack/react-router";
import { GuardSite } from "@/components/fox/sky-window";

export const Route = createFileRoute("/guard")({ component: GuardPage });

function GuardPage() {
  return (
    <main style={{ minHeight: "100dvh", background: "#101418" }}>
      <GuardSite publicPage />
    </main>
  );
}
