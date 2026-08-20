import { VIDEO_ASSET_SELECT } from "@/utils/getVideoAssets";
import { type MuxAssetData } from "@/utils/interfaces";
import { supabase } from "@/utils/supabase";

export interface PlaylistData {
  id: string;
  name: string;
  description: string;
  isSeries: boolean;
  videos: MuxAssetData[];
}

interface PlaylistRow {
  id: string;
  name: string;
  description: string;
  is_series: boolean;
  items: {
    position: number;
    video: MuxAssetData | null;
  }[];
}

const PLAYLIST_SELECT = `
  id,
  name,
  description,
  is_series,
  items:playlist_items(
    position,
    video:assets!playlist_items_asset_id_fkey(
      ${VIDEO_ASSET_SELECT}
    )
  )
`;

function normalizePlaylist(row: PlaylistRow): PlaylistData {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    isSeries: row.is_series,
    videos: row.items
      .sort((a, b) => a.position - b.position)
      .flatMap(({ video }) => (video ? [video] : [])),
  };
}

export async function getPlaylists() {
  const { data, error } = await supabase
    .schema("mux")
    .from("playlists")
    .select(PLAYLIST_SELECT)
    .order("created_at", { ascending: false })
    .overrideTypes<PlaylistRow[], { merge: false }>();

  if (error) throw error;
  return data.map(normalizePlaylist);
}

export async function getPlaylist(id: string) {
  const { data, error } = await supabase
    .schema("mux")
    .from("playlists")
    .select(PLAYLIST_SELECT)
    .eq("id", id)
    .single()
    .overrideTypes<PlaylistRow, { merge: false }>();

  if (error) throw error;
  return normalizePlaylist(data);
}
