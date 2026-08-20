import { useQuery } from "@tanstack/react-query";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { VideoCard } from "@/components/video-feed";
import { useSession } from "@/context/auth";
import { getSavedVideos, savedVideosKey } from "@/utils/savedVideos";

const GOLD = "#f5a100";

export default function LibraryScreen() {
  const { session } = useSession();
  const userId = session?.user.id ?? "";
  const {
    data: videos = [],
    isError,
    isLoading,
    isRefetching,
    refetch,
  } = useQuery({
    queryKey: savedVideosKey(userId),
    queryFn: () => getSavedVideos(userId),
    enabled: Boolean(userId),
  });

  return (
    <SafeAreaView style={styles.root}>
      <Text accessibilityRole="header" style={styles.title}>
        Library
      </Text>
      <Text style={styles.subtitle}>Videos saved for later</Text>

      {isLoading ? (
        <View accessibilityLabel="Loading saved videos" style={styles.state}>
          <ActivityIndicator color={GOLD} />
        </View>
      ) : isError ? (
        <View style={styles.state}>
          <Text style={styles.stateTitle}>Couldn&apos;t load your library.</Text>
          <Pressable
            accessibilityLabel="Retry loading saved videos"
            accessibilityRole="button"
            onPress={() => void refetch()}
            style={styles.retryButton}
          >
            <Text style={styles.retryText}>Try again</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={videos}
          keyExtractor={(video) => video.id}
          renderItem={({ item }) => <VideoCard item={item} />}
          refreshControl={
            <RefreshControl
              onRefresh={() => void refetch()}
              refreshing={isRefetching}
              tintColor={GOLD}
            />
          }
          contentContainerStyle={
            videos.length ? styles.list : styles.emptyList
          }
          ListEmptyComponent={
            <View style={styles.state}>
              <Text style={styles.stateTitle}>No saved videos yet</Text>
              <Text style={styles.stateText}>
                Tap Save on a video to keep it here.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#000",
  },
  title: {
    marginHorizontal: 16,
    marginTop: 16,
    color: "#fafafa",
    fontFamily: "Sora_700Bold",
    fontSize: 32,
  },
  subtitle: {
    marginHorizontal: 16,
    marginTop: 4,
    marginBottom: 18,
    color: "#a1a1aa",
    fontFamily: "Sora_400Regular",
    fontSize: 14,
  },
  list: {
    paddingBottom: 20,
  },
  emptyList: {
    flexGrow: 1,
  },
  state: {
    flex: 1,
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
    lineHeight: 20,
    textAlign: "center",
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
