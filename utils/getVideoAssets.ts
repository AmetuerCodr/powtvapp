import { supabase } from "@/utils/supabase";
import { MuxAssetData } from "@/utils/interfaces";
import { devCache } from "@/utils/devCache";

export async function getVideoAssets(
  page: number = 1,
  pageSize: number = 15,
  excludeAssetId?: string,
  aspectRatio?: string,
): Promise<MuxAssetData[]> {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  return devCache(
    `videos:${page}:${pageSize}:${excludeAssetId ?? "all"}:${aspectRatio ?? "all"}`,
    async () => {
      const startedAt = performance.now();
      let query = supabase
        .schema("mux")
        .from("assets")
        .select(
          "id, status, duration_seconds, max_resolution_tier, max_stored_frame_rate, aspect_ratio, playback_ids, created_at, meta",
        )
        .eq("status", "ready");

      if (excludeAssetId) query = query.neq("id", excludeAssetId);
      if (aspectRatio) query = query.eq("aspect_ratio", aspectRatio);

      const { data, error } = await query
        .order("created_at", { ascending: false })
        .order("id", { ascending: false })
        .range(from, to)
        .returns<MuxAssetData[]>();

      if (error) throw error;

      console.log(
        `Query took ${(performance.now() - startedAt).toFixed(2)}ms`,
      );
      return data;
    },
  );
}
