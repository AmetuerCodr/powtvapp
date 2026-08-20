import { VIDEO_ASSET_SELECT } from "@/utils/getVideoAssets";
import { type MuxAssetData } from "@/utils/interfaces";
import { supabase } from "@/utils/supabase";

export const savedVideosKey = (userId: string) =>
  ["saved-videos", userId] as const;

export const savedVideoKey = (userId: string, assetId: string) =>
  ["saved-video", userId, assetId] as const;

export async function isVideoSaved(userId: string, assetId: string) {
  const { data, error } = await supabase
    .from("saved_videos")
    .select("asset_id")
    .eq("user_id", userId)
    .eq("asset_id", assetId)
    .maybeSingle();

  if (error) throw error;
  return Boolean(data);
}

export async function setVideoSaved(
  userId: string,
  assetId: string,
  saved: boolean,
) {
  const query = saved
    ? supabase.from("saved_videos").insert({ user_id: userId, asset_id: assetId })
    : supabase
        .from("saved_videos")
        .delete()
        .eq("user_id", userId)
        .eq("asset_id", assetId);
  const { error } = await query;

  if (error) throw error;
  return saved;
}

export async function getSavedVideos(userId: string) {
  const { data: savedRows, error: savedError } = await supabase
    .from("saved_videos")
    .select("asset_id")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (savedError) throw savedError;
  if (!savedRows.length) return [];

  const { data: videos, error: videoError } = await supabase
    .schema("mux")
    .from("assets")
    .select(VIDEO_ASSET_SELECT)
    .in(
      "id",
      savedRows.map(({ asset_id }) => asset_id),
    )
    .overrideTypes<MuxAssetData[], { merge: false }>();

  if (videoError) throw videoError;

  const videosById = new Map(videos.map((video) => [video.id, video]));
  return savedRows.flatMap(({ asset_id }) => {
    const video = videosById.get(asset_id);
    return video ? [video] : [];
  });
}
