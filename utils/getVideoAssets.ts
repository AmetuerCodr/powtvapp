import { supabase } from "@/utils/supabase";
import { MuxAssetData } from "@/utils/interfaces";
import { devCache } from "@/utils/devCache";
import {
  escapeLikePattern,
  normalizeSearchTerm,
  type VideoCategory,
} from "@/utils/search";

export const VIDEO_ASSET_SELECT = `
  id,
  category,
  creator_id,
  status,
  duration_seconds,
  max_resolution_tier,
  max_stored_frame_rate,
  aspect_ratio,
  playback_ids,
  created_at,
  meta,
  creator:creators!assets_creator_id_fkey!inner(
    id,
    name,
    avatar_url,
    description,
    is_guest
  )
`;

export interface GetVideoAssetsOptions {
  excludeAssetId?: string;
  aspectRatio?: string;
  guestOnly?: boolean;
  category?: VideoCategory;
}

export async function getVideoAssets(
  page: number = 1,
  pageSize: number = 15,
  {
    excludeAssetId,
    aspectRatio,
    guestOnly = false,
    category,
  }: GetVideoAssetsOptions = {},
): Promise<MuxAssetData[]> {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  return devCache(
    `videos:${page}:${pageSize}:${excludeAssetId ?? "all"}:${aspectRatio ?? "all"}:${guestOnly ? "guest" : "all-creators"}:${category ?? "all-categories"}`,
    async () => {
      const startedAt = performance.now();
      let query = supabase
        .schema("mux")
        .from("assets")
        .select(VIDEO_ASSET_SELECT)
        .eq("status", "ready");

      if (excludeAssetId) query = query.neq("id", excludeAssetId);
      if (aspectRatio) query = query.eq("aspect_ratio", aspectRatio);
      if (guestOnly) query = query.eq("creator.is_guest", true);
      if (category) query = query.eq("category", category);

      const { data, error } = await query
        .order("created_at", { ascending: false })
        .order("id", { ascending: false })
        .range(from, to)
        .overrideTypes<MuxAssetData[], { merge: false }>();

      if (error) throw error;

      console.log(`Query took ${(performance.now() - startedAt).toFixed(2)}ms`);
      return data;
    },
  );
}

export async function searchVideoAssets(
  term: string,
  limit: number = 20,
): Promise<MuxAssetData[]> {
  const normalizedTerm = normalizeSearchTerm(term);
  const normalizedLimit = Number.isFinite(limit)
    ? Math.max(0, Math.floor(limit))
    : 0;

  if (!normalizedTerm || normalizedLimit === 0) return [];

  const { data, error } = await supabase
    .schema("mux")
    .from("assets")
    .select(VIDEO_ASSET_SELECT)
    .eq("status", "ready")
    .ilike("meta->>title", `%${escapeLikePattern(normalizedTerm)}%`)
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(normalizedLimit)
    .overrideTypes<MuxAssetData[], { merge: false }>();

  if (error) throw error;
  return data;
}

export async function getVideoAsset(id: string): Promise<MuxAssetData> {
  const { data, error } = await supabase
    .schema("mux")
    .from("assets")
    .select(VIDEO_ASSET_SELECT)
    .eq("id", id)
    .eq("status", "ready")
    .single()
    .overrideTypes<MuxAssetData, { merge: false }>();

  if (error) throw error;
  return data;
}
