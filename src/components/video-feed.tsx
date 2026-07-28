import { type ReactNode, useCallback, useMemo } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { FlashList } from "@shopify/flash-list";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Image } from "expo-image";
import { Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { clearDevCache } from "@/utils/devCache";
import { getVideoAssets } from "@/utils/getVideoAssets";
import { MuxAssetData } from "@/utils/interfaces";
import {
  getPublicPlaybackId,
  getVideoFeedItems,
  type VideoFeedItem,
} from "@/utils/shorts";

const COLORS = {
  bgBase: "#000000",
  bgElevated: "#27272a",
  amber500: "#f5a100",
  textPrimary: "#fafafa",
  textMuted: "#a1a1aa",
};

interface VideoFeedProps {
  emptyMessage?: string;
  excludeAssetId?: string;
  header?: ReactNode;
  pageSize?: number;
  title?: string;
}

interface Page {
  videos: MuxAssetData[];
  nextPage: number;
}

type FeedItem = VideoFeedItem<MuxAssetData>;

function getThumbnailUrl(item: MuxAssetData, preferMux = false) {
  const playbackId = getPublicPlaybackId(item.playback_ids);
  const muxThumbnail = playbackId
    ? `https://image.mux.com/${playbackId}/thumbnail.webp`
    : undefined;

  return preferMux
    ? muxThumbnail || item.meta?.thumbnail_url
    : item.meta?.thumbnail_url || muxThumbnail;
}

function formatDuration(durationSeconds: number) {
  if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) return;

  const totalSeconds = Math.round(durationSeconds);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return hours
    ? `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
    : `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function formatPublishedDate(createdAt: string) {
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return;

  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function ShortsShelfCard({ item }: { item: MuxAssetData }) {
  const title = item.meta?.title || "Untitled Short";
  const thumbnailUrl = getThumbnailUrl(item, true);

  return (
    <View style={styles.shortCard}>
      <Link href="/(app)/watch" asChild>
        <Pressable
          accessibilityLabel={`Open Shorts feed from ${title}`}
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.shortCardButton,
            pressed && styles.cardPressed,
          ]}
        >
          <View style={styles.shortThumbWrap}>
            <Image
              cachePolicy="memory-disk"
              contentFit="contain"
              recyclingKey={item.id}
              source={
                thumbnailUrl
                  ? { uri: thumbnailUrl }
                  : require("../../assets/images/Video.png")
              }
              style={styles.thumb}
            />
          </View>
          <Text numberOfLines={2} style={styles.shortTitle}>
            {title}
          </Text>
        </Pressable>
      </Link>
    </View>
  );
}

function ShortsShelf({ videos }: { videos: MuxAssetData[] }) {
  return (
    <View style={styles.shortsShelf}>
      <View style={styles.shortsShelfHeader}>
        <Text style={styles.shortsShelfTitle}>Shorts</Text>
        <Link href="/(app)/watch" asChild>
          <Pressable
            accessibilityLabel="View all Shorts"
            accessibilityRole="button"
            style={styles.viewAllButton}
          >
            <Text style={styles.viewAllText}>View all</Text>
          </Pressable>
        </Link>
      </View>
      <ScrollView
        contentContainerStyle={styles.shortsShelfContent}
        directionalLockEnabled
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        {videos.map((video) => (
          <ShortsShelfCard item={video} key={video.id} />
        ))}
      </ScrollView>
    </View>
  );
}

function VideoCard({ item }: { item: MuxAssetData }) {
  const title = item.meta?.title || "Untitled video";
  const thumbnailUrl = getThumbnailUrl(item);
  const duration = formatDuration(item.duration_seconds);
  const publishedDate = formatPublishedDate(item.created_at);

  return (
    <Link
      href={{
        pathname: "/(app)/video/[asset_id]",
        params: { asset_id: item.id },
      }}
      asChild
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Play ${title}`}
        style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      >
        <View style={styles.thumbWrap}>
          <Image
            source={
              thumbnailUrl
                ? { uri: thumbnailUrl }
                : require("../../assets/images/Video.png")
            }
            style={styles.thumb}
            cachePolicy="memory-disk"
            recyclingKey={item.id}
            contentFit="contain"
          />
          {duration ? (
            <View style={styles.durationPill}>
              <Text style={styles.durationText}>{duration}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.infoRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>P</Text>
          </View>
          <View style={styles.infoText}>
            <Text style={styles.videoTitle} numberOfLines={2}>
              {title}
            </Text>
            <Text style={styles.metaLine} numberOfLines={1}>
              {publishedDate ? `POW TV • ${publishedDate}` : "POW TV"}
            </Text>
          </View>
        </View>
      </Pressable>
    </Link>
  );
}

export default function VideoFeed({
  emptyMessage = "No videos available.",
  excludeAssetId,
  header,
  pageSize = 15,
  title,
}: VideoFeedProps) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isError,
    isFetchNextPageError,
    isFetchingNextPage,
    isLoading,
    isRefetching,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["video-feed", pageSize, excludeAssetId ?? null],
    initialPageParam: 1,
    queryFn: async ({ pageParam }): Promise<Page> => {
      try {
        return {
          videos: await getVideoAssets(pageParam, pageSize, excludeAssetId),
          nextPage: pageParam + 1,
        };
      } catch (fetchError) {
        if (__DEV__) console.warn("video feed error", fetchError);
        throw fetchError;
      }
    },
    getNextPageParam: (lastPage) =>
      lastPage.videos.length === pageSize ? lastPage.nextPage : undefined,
  });

  const videos = useMemo(() => {
    const uniqueVideos = new Map<string, MuxAssetData>();
    for (const page of data?.pages ?? []) {
      for (const video of page.videos) uniqueVideos.set(video.id, video);
    }
    return [...uniqueVideos.values()];
  }, [data]);
  const feedItems = useMemo(() => getVideoFeedItems(videos), [videos]);

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchNextPageError && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [
    fetchNextPage,
    hasNextPage,
    isFetchNextPageError,
    isFetchingNextPage,
  ]);

  const handleRefresh = useCallback(async () => {
    await clearDevCache();
    await refetch();
  }, [refetch]);

  return (
    <SafeAreaView style={styles.root} edges={[]}>
      <FlashList
        data={feedItems}
        getItemType={(item) => item.type}
        keyExtractor={(item) => item.key}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            tintColor={COLORS.amber500}
            refreshing={isRefetching}
            onRefresh={() => void handleRefresh()}
          />
        }
        drawDistance={600}
        renderItem={({ item }: { item: FeedItem }) =>
          item.type === "shorts" ? (
            <ShortsShelf videos={item.videos} />
          ) : (
            <VideoCard item={item.video} />
          )
        }
        onEndReachedThreshold={0.7}
        onEndReached={handleEndReached}
        ListHeaderComponent={
          header || title ? (
            <>
              {header}
              {title ? <Text style={styles.sectionTitle}>{title}</Text> : null}
            </>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.stateContainer}>
            {isLoading ? (
              <ActivityIndicator color={COLORS.amber500} />
            ) : (
              <Text style={styles.stateText}>
                {isError
                  ? "Couldn't load videos. Pull to refresh."
                  : emptyMessage}
              </Text>
            )}
          </View>
        }
        ListFooterComponent={
          isFetchNextPageError ? (
            <Pressable
              accessibilityLabel="Retry loading more videos"
              accessibilityRole="button"
              onPress={() => void fetchNextPage()}
              style={styles.loadMoreButton}
            >
              <Text style={styles.loadMoreText}>Tap to load more videos</Text>
            </Pressable>
          ) : isFetchingNextPage ? (
            <ActivityIndicator
              color={COLORS.amber500}
              size="small"
              style={styles.footer}
            />
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.bgBase,
  },
  listContent: {
    paddingBottom: 20,
  },
  sectionTitle: {
    marginHorizontal: 12,
    marginTop: 20,
    marginBottom: 4,
    fontFamily: "Sora_700Bold",
    fontSize: 20,
    color: COLORS.textPrimary,
  },
  stateContainer: {
    minHeight: 120,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  stateText: {
    fontFamily: "Sora_400Regular",
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: "center",
  },
  footer: {
    marginVertical: 12,
  },
  card: {
    marginHorizontal: 12,
    marginBottom: 20,
  },
  cardPressed: {
    opacity: 0.8,
  },
  shortsShelf: {
    marginBottom: 20,
  },
  shortsShelfHeader: {
    minHeight: 44,
    marginHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  shortsShelfTitle: {
    color: COLORS.textPrimary,
    fontFamily: "Sora_700Bold",
    fontSize: 20,
  },
  viewAllButton: {
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  viewAllText: {
    color: COLORS.amber500,
    fontFamily: "Sora_600SemiBold",
    fontSize: 13,
  },
  shortsShelfContent: {
    gap: 10,
    paddingHorizontal: 12,
  },
  shortCard: {
    width: 148,
    flexShrink: 0,
  },
  shortCardButton: {
    width: "100%",
  },
  shortThumbWrap: {
    width: "100%",
    aspectRatio: 9 / 16,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: COLORS.bgElevated,
  },
  shortTitle: {
    minHeight: 38,
    marginTop: 8,
    color: COLORS.textPrimary,
    fontFamily: "Sora_600SemiBold",
    fontSize: 13,
    lineHeight: 18,
  },
  thumbWrap: {
    width: "100%",
    aspectRatio: 16 / 9,
    marginVertical: 10,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: COLORS.bgElevated,
  },
  thumb: {
    width: "100%",
    height: "100%",
  },
  durationPill: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.8)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  durationText: {
    fontFamily: "Sora_400Regular",
    fontSize: 11,
    color: COLORS.textPrimary,
  },
  infoRow: {
    flexDirection: "row",
    marginTop: 12,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.amber500,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarText: {
    fontFamily: "Sora_700Bold",
    fontSize: 16,
    color: COLORS.bgBase,
  },
  infoText: {
    flex: 1,
  },
  videoTitle: {
    fontFamily: "Sora_600SemiBold",
    fontSize: 15,
    lineHeight: 20,
    color: COLORS.textPrimary,
  },
  metaLine: {
    fontFamily: "Sora_400Regular",
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  loadMoreButton: {
    minHeight: 44,
    alignSelf: "center",
    justifyContent: "center",
    marginVertical: 12,
    paddingHorizontal: 16,
  },
  loadMoreText: {
    color: COLORS.amber500,
    fontFamily: "Sora_600SemiBold",
    fontSize: 13,
  },
});
