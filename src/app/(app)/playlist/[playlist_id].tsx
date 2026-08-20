import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { VideoCard } from "@/components/video-feed";
import { getPlaylist } from "@/utils/playlists";

const GOLD = "#f5a100";

export default function PlaylistScreen() {
  const params = useLocalSearchParams<{ playlist_id: string }>();
  const playlistId = params.playlist_id;
  const { data: playlist, isError, isLoading, refetch } = useQuery({
    queryKey: ["playlist", playlistId],
    queryFn: () => getPlaylist(playlistId),
    enabled: Boolean(playlistId),
  });

  if (isLoading) {
    return (
      <SafeAreaView edges={["bottom"]} style={styles.root}>
        <View accessibilityLabel="Loading playlist" style={styles.state}>
          <ActivityIndicator color={GOLD} />
        </View>
      </SafeAreaView>
    );
  }

  if (isError || !playlist) {
    return (
      <SafeAreaView edges={["bottom"]} style={styles.root}>
        <View style={styles.state}>
          <Text style={styles.stateTitle}>Couldn&apos;t load this playlist.</Text>
          <Pressable
            accessibilityLabel="Retry loading playlist"
            accessibilityRole="button"
            onPress={() => void refetch()}
            style={styles.retryButton}
          >
            <Text style={styles.retryText}>Try again</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const itemLabel = playlist.isSeries
    ? `${playlist.videos.length} ${playlist.videos.length === 1 ? "episode" : "episodes"}`
    : `${playlist.videos.length} ${playlist.videos.length === 1 ? "video" : "videos"}`;

  return (
    <SafeAreaView edges={["bottom"]} style={styles.root}>
      <FlatList
        data={playlist.videos}
        keyExtractor={(video) => video.id}
        renderItem={({ item }) => <VideoCard item={item} />}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.eyebrow}>
              {playlist.isSeries ? "SERIES" : "PLAYLIST"}
            </Text>
            <Text accessibilityRole="header" style={styles.title}>
              {playlist.name}
            </Text>
            {playlist.description ? (
              <Text style={styles.description}>{playlist.description}</Text>
            ) : null}
            <Text style={styles.count}>{itemLabel}</Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.stateTitle}>No videos yet</Text>
            <Text style={styles.stateText}>Check back soon.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#000",
  },
  list: {
    paddingBottom: 20,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 18,
  },
  eyebrow: {
    color: GOLD,
    fontFamily: "Sora_600SemiBold",
    fontSize: 12,
    letterSpacing: 1.2,
  },
  title: {
    marginTop: 6,
    color: "#fafafa",
    fontFamily: "Sora_700Bold",
    fontSize: 28,
    lineHeight: 35,
  },
  description: {
    marginTop: 10,
    color: "#d4d4d8",
    fontFamily: "Sora_400Regular",
    fontSize: 14,
    lineHeight: 21,
  },
  count: {
    marginTop: 10,
    color: "#a1a1aa",
    fontFamily: "Sora_400Regular",
    fontSize: 13,
  },
  state: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  emptyState: {
    minHeight: 180,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  stateTitle: {
    color: "#fafafa",
    fontFamily: "Sora_600SemiBold",
    fontSize: 16,
    textAlign: "center",
  },
  stateText: {
    marginTop: 8,
    color: "#a1a1aa",
    fontFamily: "Sora_400Regular",
    fontSize: 14,
  },
  retryButton: {
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  retryText: {
    color: GOLD,
    fontFamily: "Sora_600SemiBold",
    fontSize: 14,
  },
});
