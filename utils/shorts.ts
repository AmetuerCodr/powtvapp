export function getPublicPlaybackId(playbackIds: unknown) {
  if (!Array.isArray(playbackIds)) return;

  for (const candidate of playbackIds) {
    if (
      candidate &&
      typeof candidate === "object" &&
      "id" in candidate &&
      "policy" in candidate &&
      candidate.policy === "public" &&
      typeof candidate.id === "string" &&
      candidate.id.trim().length > 0
    ) {
      return candidate.id;
    }
  }
}

interface PlaybackAsset {
  id: string;
  playback_ids?: unknown;
}

interface AspectRatioAsset {
  id: string;
  aspect_ratio?: unknown;
}

export interface PlayableShort<T extends PlaybackAsset> {
  asset: T;
  playbackId: string;
}

export type VideoFeedItem<T extends AspectRatioAsset> =
  | { key: string; type: "video"; video: T }
  | { key: string; type: "shorts"; videos: T[] };

export function getPlayableShorts<T extends PlaybackAsset>(
  pages: ReadonlyArray<ReadonlyArray<T>>,
) {
  const shorts = new Map<string, PlayableShort<T>>();

  for (const page of pages) {
    for (const asset of page) {
      const playbackId = getPublicPlaybackId(asset.playback_ids);
      if (playbackId) shorts.set(asset.id, { asset, playbackId });
    }
  }

  return [...shorts.values()];
}

export function getVideoFeedItems<T extends AspectRatioAsset>(
  videos: ReadonlyArray<T>,
) {
  const items: VideoFeedItem<T>[] = [];
  let portraitVideos: T[] = [];

  const flushPortraitVideos = () => {
    if (!portraitVideos.length) return;

    if (portraitVideos.length >= 2) {
      const shelfVideos = portraitVideos.slice(0, 4);
      items.push({
        key: `shorts:${shelfVideos[0].id}`,
        type: "shorts",
        videos: shelfVideos,
      });
      for (const video of portraitVideos.slice(4)) {
        items.push({ key: `video:${video.id}`, type: "video", video });
      }
    } else {
      const [video] = portraitVideos;
      items.push({ key: `video:${video.id}`, type: "video", video });
    }

    portraitVideos = [];
  };

  for (const video of videos) {
    if (video.aspect_ratio === "9:16") {
      portraitVideos.push(video);
    } else {
      flushPortraitVideos();
      items.push({ key: `video:${video.id}`, type: "video", video });
    }
  }

  flushPortraitVideos();
  return items;
}
