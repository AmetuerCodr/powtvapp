import { type VideoCategory } from "@/utils/search";

export interface CreatorData {
  id: string;
  name: string | null;
  avatar_url: string | null;
  description: string | null;
  is_guest: boolean;
}

export interface MuxAssetData {
  id: string;
  category: VideoCategory;
  creator_id: string;
  creator: CreatorData;
  meta: {
    title: string;
    thumbnail_url: string;
  };
  status: "ready" | "preparing" | "entered";
  duration_seconds: number;
  max_resolution_tier: "2160p" | "1080p" | "720p" | "480p" | "360p";
  max_stored_frame_rate: number;
  aspect_ratio: string;
  playback_ids: Array<{
    id: string;
    policy: "public" | "signed";
  }>;
  created_at: string;
}
