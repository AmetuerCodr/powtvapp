import VideoFeed from "@/components/video-feed";

export default function GuestCreatorsScreen() {
  return (
    <VideoFeed
      emptyMessage="No guest creator videos are available yet."
      guestOnly
    />
  );
}
