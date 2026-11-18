import { createFileRoute } from "@tanstack/react-router";
import { VideoPlatform } from "@/components/video-platform";

export const Route = createFileRoute("/video")({ component: VideoPage });

function VideoPage() {
  return <VideoPlatform />;
}
