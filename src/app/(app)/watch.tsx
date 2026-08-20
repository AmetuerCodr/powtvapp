import { useEvent } from "expo";
import { Ionicons } from "@expo/vector-icons";
import {
  FlashList,
  type FlashListProps,
  type ListRenderItemInfo,
} from "@shopify/flash-list";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useVideoPlayer, VideoView } from "expo-video";
import {
  AppState,
  type AppStateStatus,
  ActivityIndicator,
  Alert,
  type LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import CreatorAvatar from "@/components/creator-avatar";
import { useSession } from "@/context/auth";
import { getVideoAssets } from "@/utils/getVideoAssets";
import type { MuxAssetData } from "@/utils/interfaces";
import {
  isVideoSaved,
  savedVideoKey,
  savedVideosKey,
  setVideoSaved,
} from "@/utils/savedVideos";
import {
  getPlayableShorts,
  type PlayableShort,
} from "@/utils/shorts";

const PAGE_SIZE = 5;
const SHORTS_ASPECT_RATIO = "9:16";

interface ShortsPage {
  videos: MuxAssetData[];
  nextPage: number;
}

type Short = PlayableShort<MuxAssetData>;

interface ShortPageProps {
  appIsActive: boolean;
  isActive: boolean;
  routeIsFocused: boolean;
  short: Short;
  viewportHeight: number;
}

type ShortActionIcon =
  | "thumbs-up-outline"
  | "chatbubble-outline"
  | "arrow-redo-outline";

function ShortAction({
  icon,
  label,
}: {
  icon: ShortActionIcon;
  label: string;
}) {
  return (
    <Pressable
      accessibilityHint="Coming soon"
      accessibilityLabel={label}
      accessibilityRole="button"
      onPress={() =>
        Alert.alert("Coming soon", `${label} for Shorts is not connected yet.`)
      }
      style={styles.actionButton}
    >
      <View style={styles.actionIcon}>
        <Ionicons color="#FFFFFF" name={icon} size={25} />
      </View>
      <Text style={styles.actionLabel}>{label}</Text>
    </Pressable>
  );
}

function ShortSaveAction({ assetId }: { assetId: string }) {
  const { session } = useSession();
  const userId = session?.user.id ?? "";
  const queryClient = useQueryClient();
  const {
    data: isSaved,
    isError: isSavedError,
    isFetching: isSavedFetching,
    refetch: refetchSaved,
  } = useQuery({
    queryKey: savedVideoKey(userId, assetId),
    queryFn: () => isVideoSaved(userId, assetId),
    enabled: Boolean(userId && assetId),
  });
  const saveMutation = useMutation({
    mutationFn: ({
      userId,
      assetId,
      saved,
    }: {
      userId: string;
      assetId: string;
      saved: boolean;
    }) => setVideoSaved(userId, assetId, saved),
    onSuccess: (saved, variables) => {
      queryClient.setQueryData(
        savedVideoKey(variables.userId, variables.assetId),
        saved,
      );
      void queryClient.invalidateQueries({
        queryKey: savedVideosKey(variables.userId),
      });
    },
    onError: () =>
      Alert.alert("Save failed", "Please check your connection and try again."),
  });
  const savingThis =
    saveMutation.isPending && saveMutation.variables?.assetId === assetId;
  const saveIsBusy = !userId || isSavedFetching || savingThis;

  return (
    <Pressable
      accessibilityLabel={
        isSavedError
          ? "Retry loading saved status"
          : isSaved
            ? "Remove from Library"
            : "Save to Library"
      }
      accessibilityRole="button"
      accessibilityState={{
        busy: isSavedFetching || savingThis,
        disabled: saveIsBusy,
        selected: Boolean(isSaved),
      }}
      disabled={saveIsBusy}
      onPress={() => {
        if (isSavedError) void refetchSaved();
        else
          saveMutation.mutate({
            userId,
            assetId,
            saved: !isSaved,
          });
      }}
      style={styles.actionButton}
    >
      <View style={[styles.actionIcon, isSaved && styles.savedActionIcon]}>
        {isSavedFetching || savingThis ? (
          <ActivityIndicator
            color={isSaved ? "#000000" : "#FFFFFF"}
            size="small"
          />
        ) : (
          <Ionicons
            color={isSaved ? "#000000" : "#FFFFFF"}
            name={
              isSavedError
                ? "refresh-outline"
                : isSaved
                  ? "bookmark"
                  : "bookmark-outline"
            }
            size={25}
          />
        )}
      </View>
      <Text style={styles.actionLabel}>
        {isSavedError
          ? "Retry"
          : savingThis
            ? "Saving…"
            : isSaved
              ? "Saved"
              : "Save"}
      </Text>
    </Pressable>
  );
}

function ShortPage({
  appIsActive,
  isActive,
  routeIsFocused,
  short,
  viewportHeight,
}: ShortPageProps) {
  const [pausedAssetId, setPausedAssetId] = useState<string>();
  const insets = useSafeAreaInsets();
  const manuallyPaused = pausedAssetId === short.asset.id;
  const title =
    typeof short.asset.meta?.title === "string"
      ? short.asset.meta.title.trim()
      : "";
  const player = useVideoPlayer(
    {
      uri: `https://stream.mux.com/${short.playbackId}.m3u8`,
      contentType: "hls",
    },
    (videoPlayer) => {
      videoPlayer.loop = true;
    },
  );
  const playerState = useEvent(player, "statusChange", {
    status: player.status,
  });
  const hasPlaybackError = playerState.status === "error";
  const shouldPlay =
    isActive &&
    routeIsFocused &&
    appIsActive &&
    !manuallyPaused &&
    !hasPlaybackError;

  useEffect(() => {
    if (shouldPlay) player.play();
    else player.pause();

    if (!isActive || !routeIsFocused || !appIsActive) {
      player.currentTime = 0;
      setPausedAssetId(undefined);
    }
  }, [appIsActive, isActive, player, routeIsFocused, shouldPlay]);

  return (
    <View
      accessibilityElementsHidden={!isActive}
      importantForAccessibility={isActive ? "auto" : "no-hide-descendants"}
      style={[styles.page, { height: viewportHeight }]}
    >
      <VideoView
        contentFit="cover"
        nativeControls={false}
        player={player}
        style={StyleSheet.absoluteFill}
      />

      <Pressable
        accessibilityHint={
          hasPlaybackError
            ? undefined
            : "Tap to pause or resume playback"
        }
        accessibilityLabel={
          hasPlaybackError
            ? "This Short is unavailable"
            : `${manuallyPaused ? "Play" : "Pause"} ${title || "short video"}`
        }
        accessibilityRole="button"
        disabled={!isActive || hasPlaybackError}
        onPress={() =>
          setPausedAssetId((current) =>
            current === short.asset.id ? undefined : short.asset.id,
          )
        }
        style={StyleSheet.absoluteFill}
      >
        {isActive &&
        (playerState.status === "idle" ||
          playerState.status === "loading") ? (
          <ActivityIndicator
            color="#FFFFFF"
            size="large"
            style={styles.centerIndicator}
          />
        ) : null}

        {manuallyPaused ? (
          <View style={styles.pauseIndicator}>
            <Ionicons color="#FFFFFF" name="play" size={38} />
          </View>
        ) : null}

        {hasPlaybackError ? (
          <View style={styles.playbackError}>
            <Text style={styles.stateText}>This Short is unavailable.</Text>
          </View>
        ) : null}
      </Pressable>

      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.9)"]}
        pointerEvents="none"
        style={[
          styles.titleGradient,
          { paddingBottom: Math.max(insets.bottom, 16) + 16 },
        ]}
      >
        <View style={styles.creatorRow}>
          <CreatorAvatar
            creator={short.asset.creator}
            size={34}
            style={styles.creatorAvatar}
          />
          <Text numberOfLines={1} style={styles.creatorName}>
            {short.asset.creator?.name || "Creator"}
          </Text>
        </View>
        {title ? (
          <Text numberOfLines={3} style={styles.title}>
            {title}
          </Text>
        ) : null}
      </LinearGradient>

      {!hasPlaybackError ? (
        <View
          style={[
            styles.actionRail,
            { bottom: Math.max(insets.bottom, 16) + 104 },
          ]}
        >
          <ShortAction icon="thumbs-up-outline" label="Like" />
          <ShortAction icon="chatbubble-outline" label="Comments" />
          <ShortAction icon="arrow-redo-outline" label="Share" />
          <ShortSaveAction assetId={short.asset.id} />
        </View>
      ) : null}
    </View>
  );
}

export default function ShortsScreen() {
  const [appState, setAppState] = useState<AppStateStatus>(
    AppState.currentState,
  );
  const [activeAssetId, setActiveAssetId] = useState<string>();
  const [routeIsFocused, setRouteIsFocused] = useState(false);
  const [viewportHeight, setViewportHeight] = useState(0);
  const insets = useSafeAreaInsets();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isError,
    isFetchingNextPage,
    isFetchNextPageError,
    isLoading,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["shorts", SHORTS_ASPECT_RATIO, PAGE_SIZE],
    initialPageParam: 1,
    queryFn: async ({ pageParam }): Promise<ShortsPage> => ({
      videos: await getVideoAssets(pageParam, PAGE_SIZE, {
        aspectRatio: SHORTS_ASPECT_RATIO,
      }),
      nextPage: pageParam + 1,
    }),
    getNextPageParam: (lastPage) =>
      lastPage.videos.length === PAGE_SIZE ? lastPage.nextPage : undefined,
  });

  const shorts = useMemo(
    () => getPlayableShorts((data?.pages ?? []).map(({ videos }) => videos)),
    [data],
  );

  useFocusEffect(
    useCallback(() => {
      setRouteIsFocused(true);
      return () => setRouteIsFocused(false);
    }, []),
  );

  useEffect(() => {
    const subscription = AppState.addEventListener("change", setAppState);
    return () => subscription.remove();
  }, []);

  const activeIndex = shorts.findIndex(
    ({ asset }) => asset.id === activeAssetId,
  );

  useEffect(() => {
    if (activeIndex === -1 && shorts[0]) {
      setActiveAssetId(shorts[0].asset.id);
    }
  }, [activeIndex, shorts]);

  useEffect(() => {
    if (
      activeIndex >= 0 &&
      activeIndex >= shorts.length - 2 &&
      hasNextPage &&
      !isFetchNextPageError &&
      !isFetchingNextPage
    ) {
      void fetchNextPage();
    }
  }, [
    activeIndex,
    fetchNextPage,
    hasNextPage,
    isFetchNextPageError,
    isFetchingNextPage,
    shorts.length,
  ]);

  useEffect(() => {
    if (
      !isLoading &&
      shorts.length === 0 &&
      hasNextPage &&
      !isFetchNextPageError &&
      !isFetchingNextPage
    ) {
      void fetchNextPage();
    }
  }, [
    fetchNextPage,
    hasNextPage,
    isFetchNextPageError,
    isFetchingNextPage,
    isLoading,
    shorts.length,
  ]);

  const onViewableItemsChanged = useRef<
    NonNullable<FlashListProps<Short>["onViewableItemsChanged"]>
  >(({ viewableItems }) => {
    const visibleShort = viewableItems.find(
      ({ isViewable, item }) => isViewable && item,
    )?.item;
    if (visibleShort) setActiveAssetId(visibleShort.asset.id);
  }).current;
  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 80,
  }).current;

  const renderShort = useCallback(
    ({ item, target }: ListRenderItemInfo<Short>) =>
      target === "Cell" ? (
        <ShortPage
          appIsActive={appState === "active"}
          isActive={item.asset.id === activeAssetId}
          routeIsFocused={routeIsFocused}
          short={item}
          viewportHeight={viewportHeight}
        />
      ) : (
        <View style={{ height: viewportHeight }} />
      ),
    [activeAssetId, appState, routeIsFocused, viewportHeight],
  );

  const onLayout = useCallback((event: LayoutChangeEvent) => {
    setViewportHeight(event.nativeEvent.layout.height);
  }, []);

  const showList = viewportHeight > 0 && shorts.length > 0;

  return (
    <View onLayout={onLayout} style={styles.root}>
      {routeIsFocused ? <StatusBar style="light" /> : null}

      {showList ? (
        <FlashList
          bounces={false}
          data={shorts}
          extraData={`${activeAssetId}:${appState}:${routeIsFocused}`}
          keyExtractor={({ asset }) => asset.id}
          onViewableItemsChanged={onViewableItemsChanged}
          overScrollMode="never"
          pagingEnabled
          renderItem={renderShort}
          showsVerticalScrollIndicator={false}
          style={styles.list}
          viewabilityConfig={viewabilityConfig}
        />
      ) : (
        <View style={styles.state}>
          {isLoading || viewportHeight === 0 ? (
            <ActivityIndicator color="#F5A100" size="large" />
          ) : (
            <>
              <Text style={styles.stateText}>
                {isError
                  ? "Couldn't load Shorts."
                  : "No playable Shorts are available yet."}
              </Text>
              {isError ? (
                <Pressable
                  accessibilityLabel="Retry loading Shorts"
                  accessibilityRole="button"
                  onPress={() => void refetch()}
                  style={styles.retryButton}
                >
                  <Text style={styles.retryText}>Try again</Text>
                </Pressable>
              ) : null}
            </>
          )}
        </View>
      )}

      {isFetchingNextPage ? (
        <ActivityIndicator
          color="#F5A100"
          size="small"
          style={[styles.pageNotice, { top: insets.top + 12 }]}
        />
      ) : null}

      {isFetchNextPageError ? (
        <Pressable
          accessibilityLabel="Retry loading more Shorts"
          accessibilityRole="button"
          onPress={() => void fetchNextPage()}
          style={[
            styles.pageNotice,
            styles.loadMoreError,
            { top: insets.top + 12 },
          ]}
        >
          <Text style={styles.loadMoreErrorText}>Tap to retry</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#000000",
  },
  list: {
    flex: 1,
  },
  page: {
    width: "100%",
    overflow: "hidden",
    backgroundColor: "#000000",
  },
  centerIndicator: {
    ...StyleSheet.absoluteFillObject,
  },
  pauseIndicator: {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: 72,
    height: 72,
    marginTop: -36,
    marginLeft: -36,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  playbackError: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    backgroundColor: "rgba(0,0,0,0.65)",
  },
  titleGradient: {
    position: "absolute",
    right: 0,
    bottom: 0,
    left: 0,
    minHeight: 220,
    justifyContent: "flex-end",
    paddingLeft: 20,
    paddingRight: 84,
    paddingTop: 64,
  },
  creatorRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  creatorAvatar: {
    marginRight: 9,
  },
  creatorName: {
    flexShrink: 1,
    color: "#FFFFFF",
    fontFamily: "Sora_700Bold",
    fontSize: 14,
  },
  title: {
    color: "#FFFFFF",
    fontFamily: "Sora_700Bold",
    fontSize: 20,
    lineHeight: 27,
    textShadowColor: "rgba(0,0,0,0.75)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  actionRail: {
    position: "absolute",
    right: 10,
    zIndex: 2,
    gap: 14,
  },
  actionButton: {
    minWidth: 58,
    minHeight: 58,
    alignItems: "center",
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  savedActionIcon: {
    backgroundColor: "#F5A100",
  },
  actionLabel: {
    marginTop: 4,
    color: "#FFFFFF",
    fontFamily: "Sora_600SemiBold",
    fontSize: 10,
    textShadowColor: "rgba(0,0,0,0.8)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  state: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  stateText: {
    color: "#F4F4F5",
    fontFamily: "Sora_400Regular",
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
  },
  retryButton: {
    minWidth: 112,
    minHeight: 44,
    marginTop: 18,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F5A100",
  },
  retryText: {
    color: "#000000",
    fontFamily: "Sora_600SemiBold",
    fontSize: 14,
  },
  pageNotice: {
    position: "absolute",
    alignSelf: "center",
  },
  loadMoreError: {
    minHeight: 36,
    borderRadius: 18,
    justifyContent: "center",
    paddingHorizontal: 16,
    backgroundColor: "rgba(0,0,0,0.75)",
  },
  loadMoreErrorText: {
    color: "#FFFFFF",
    fontFamily: "Sora_600SemiBold",
    fontSize: 12,
  },
});
