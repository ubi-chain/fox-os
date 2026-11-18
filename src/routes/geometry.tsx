import { createFileRoute } from "@tanstack/react-router";
import { GeometryStudio } from "@/components/geometry-studio";

export const Route = createFileRoute("/geometry")({ component: GeometryPage });

function GeometryPage() {
  return <GeometryStudio />;
}
