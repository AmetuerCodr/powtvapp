import { supabase } from "@/utils/supabase";
import { MuxAssetData } from "@/utils/interfaces";
export async function getVideoAssets(page: number = 1){
  const pageSize = 15;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  try {
    const startTime = performance.now();
    const { data } = await supabase
      .schema("mux")
      .from("assets")
      .select('id, status, duration_seconds, max_resolution_tier, max_stored_frame_rate, aspect_ratio, playback_ids, created_at, meta')
      .range(from, to)
      .returns<MuxAssetData[]>();
    
      const endTime = performance.now();
      console.log(`Query took ${(endTime - startTime).toFixed(2)}ms`)
      console.log("response: ", JSON.stringify(data, null, 3));
      return data; 
  } catch (error) {
    if (error && error instanceof Error) {
        return error?.message;
    } else {
      return String(error);
    }
  }  
}



