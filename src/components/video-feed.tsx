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
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { Image } from "expo-image";
import { Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import CreatorAvatar from "@/components/creator-avatar";
import { useDelayedLoading } from "@/hooks/use-delayed-loading";
import { clearDevCache } from "@/utils/devCache";
import { getVideoAssets } from "@/utils/getVideoAssets";
import { MuxAssetData } from "@/utils/interfaces";
import { type VideoCategory } from "@/utils/search";
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

const SKELETON_CARD_KEYS = [0, 1, 2] as const;

interface VideoFeedProps {
  category?: VideoCategory;
  emptyMessage?: string;
  excludeAssetId?: string;
  guestOnly?: boolean;
  groupShorts?: boolean;
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
              contentFit="cover"
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

function VideoFeedSkeleton() {
  return (
    <View
      accessibilityLabel="Loading videos"
      accessibilityRole="progressbar"
    >
      {SKELETON_CARD_KEYS.map((key) => (
        <View key={key} style={styles.card}>
          <View style={[styles.thumbWrap, styles.skeletonBlock]} />
          <View style={styles.infoRow}>
            <View style={[styles.avatar, styles.skeletonAvatar]} />
            <View style={styles.skeletonText}>
              <View style={[styles.skeletonBlock, styles.skeletonTitle]} />
              <View style={[styles.skeletonBlock, styles.skeletonMeta]} />
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}

export function VideoCard({ item }: { item: MuxAssetData }) {
  const queryClient = useQueryClient();
  const title = item.meta?.title || "Untitled video";
  const thumbnailUrl = getThumbnailUrl(item);
  const duration = formatDuration(item.duration_seconds);
  const publishedDate = formatPublishedDate(item.created_at);
  const creatorName = item.creator?.name || "Creator";

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
        onPressIn={() =>
          queryClient.setQueryData(["mux-asset", item.id], item)
        }
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
            contentFit="cover"
          />
          {duration ? (
            <View style={styles.durationPill}>
              <Text style={styles.durationText}>{duration}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.infoRow}>
          <CreatorAvatar creator={item.creator} style={styles.avatar} />
          <View style={styles.infoText}>
            <Text style={styles.videoTitle} numberOfLines={2}>
              {title}
            </Text>
            <Text style={styles.metaLine} numberOfLines={1}>
              {publishedDate
                ? `${creatorName} • ${publishedDate}`
                : creatorName}
            </Text>
          </View>
        </View>
      </Pressable>
    </Link>
  );
}

export default function VideoFeed({
  category,
  emptyMessage = "No videos available.",
  excludeAssetId,
  guestOnly = false,
  groupShorts = true,
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
    queryKey: [
      "video-feed",
      pageSize,
      excludeAssetId ?? null,
      guestOnly,
      category ?? null,
    ],
    initialPageParam: 1,
    queryFn: async ({ pageParam }): Promise<Page> => {
      try {
        return {
          videos: await getVideoAssets(pageParam, pageSize, {
            category,
            excludeAssetId,
            guestOnly,
          }),
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
  const showSkeleton = useDelayedLoading(isLoading);

  const videos = useMemo(() => {
    const uniqueVideos = new Map<string, MuxAssetData>();
    for (const page of data?.pages ?? []) {
      for (const video of page.videos) uniqueVideos.set(video.id, video);
    }
    return [...uniqueVideos.values()];
  }, [data]);
  const feedItems = useMemo<FeedItem[]>(
    () =>
      groupShorts
        ? getVideoFeedItems(videos)
        : videos.map((video) => ({
            key: `video:${video.id}`,
            type: "video",
            video,
          })),
    [groupShorts, videos],
  );

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchNextPageError && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchNextPageError, isFetchingNextPage]);

  const handleRefresh = useCallback(async () => {
    await clearDevCache();
    await refetch();
  }, [refetch]);

  return (
    <SafeAreaView style={styles.root} edges={[]}>
      <FlashList
        data={showSkeleton ? [] : feedItems}
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
          showSkeleton ? (
            <VideoFeedSkeleton />
          ) : isLoading ? (
            null
          ) : (
            <View style={styles.stateContainer}>
              <Text style={styles.stateText}>
                {isError
                  ? "Couldn't load videos. Pull to refresh."
                  : emptyMessage}
              </Text>
            </View>
          )
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
  skeletonBlock: {
    backgroundColor: COLORS.bgElevated,
  },
  skeletonAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  skeletonText: {
    flex: 1,
    gap: 8,
    paddingTop: 2,
  },
  skeletonTitle: {
    width: "90%",
    height: 16,
    borderRadius: 4,
  },
  skeletonMeta: {
    width: "55%",
    height: 12,
    borderRadius: 4,
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
    marginRight: 12,
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
