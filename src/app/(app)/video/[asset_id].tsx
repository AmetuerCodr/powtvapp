import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEvent } from "expo";
import {
  useFocusEffect,
  useLocalSearchParams,
  useRouter,
} from "expo-router";
import * as ScreenOrientation from "expo-screen-orientation";
import { useVideoPlayer, VideoView } from "expo-video";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import { runOnJS } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import CreatorAvatar from "@/components/creator-avatar";
import VideoControls from "@/components/VideoControls";
import VideoFeed from "@/components/video-feed";
import { useSession } from "@/context/auth";
import { useDelayedLoading } from "@/hooks/use-delayed-loading";
import { getVideoAsset } from "@/utils/getVideoAssets";
import {
  isVideoSaved,
  savedVideoKey,
  savedVideosKey,
  setVideoSaved,
} from "@/utils/savedVideos";

const playbackSpeedOptions = [0.5, 0.75, 1, 1.25, 1.5, 2];

// Pure-JS relative time — no Intl.RelativeTimeFormat (missing on Hermes/Android).
function getRelativeTime(isoString: string): string {
  const deltaSeconds = Math.round(
    (Date.now() - new Date(isoString).getTime()) / 1000,
  );
  const abs = Math.abs(deltaSeconds);

  // [upper bound in seconds, unit label, seconds per one unit]
  const units: [number, string, number][] = [
    [60, "second", 1],
    [3600, "minute", 60],
    [86400, "hour", 3600],
    [86400 * 7, "day", 86400],
    [86400 * 30, "week", 86400 * 7],
    [86400 * 365, "month", 86400 * 30],
    [Infinity, "year", 86400 * 365],
  ];

  const [, unit, perUnit] = units.find(([limit]) => abs < limit)!;
  const value = Math.floor(abs / perUnit);

  if (value === 0) return "just now";
  const label = `${value} ${unit}${value === 1 ? "" : "s"}`;
  return deltaSeconds >= 0 ? `${label} ago` : `in ${label}`;
}

function VideoDetailSkeleton({
  isLandscape,
  onBack,
  visible,
}: {
  isLandscape: boolean;
  onBack: () => void;
  visible: boolean;
}) {
  const blockStyle = visible ? styles.skeletonBlock : undefined;

  return (
    <View style={isLandscape && styles.skeletonScreenLandscape}>
      <View
        style={
          isLandscape
            ? styles.videoContainerLandscape
            : styles.videoContainerPortrait
        }
      >
        <View
          accessibilityLabel={visible ? "Loading video" : undefined}
          accessibilityRole={visible ? "progressbar" : undefined}
          style={[styles.video, blockStyle]}
        />
        {visible ? (
          <TouchableOpacity
            accessibilityLabel="Go back"
            accessibilityRole="button"
            style={styles.backButton}
            onPress={onBack}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons name="arrow-back" size={28} color="#FFFFFF" />
          </TouchableOpacity>
        ) : null}
      </View>

      {!isLandscape ? (
        <View style={styles.skeletonMetaSection}>
          <View style={[blockStyle, styles.skeletonTitle]} />
          <View style={[blockStyle, styles.skeletonMeta]} />
          <View style={styles.skeletonCreatorRow}>
            <View style={[blockStyle, styles.skeletonAvatar]} />
            <View style={styles.skeletonCreatorText}>
              <View style={[blockStyle, styles.skeletonCreatorName]} />
              <View
                style={[blockStyle, styles.skeletonCreatorDescription]}
              />
            </View>
          </View>
          <View style={styles.skeletonActionRow}>
            <View style={[blockStyle, styles.skeletonSave]} />
          </View>
        </View>
      ) : null}
    </View>
  );
}

export default function WatchScreen() {
  const params = useLocalSearchParams<{ asset_id: string }>();
  const { session } = useSession();
  const userId = session?.user.id ?? "";
  const queryClient = useQueryClient();

  // Fetch this asset's Mux row. react-query is already provided in (app)/_layout.
  const { data: video, isLoading, error } = useQuery({
    queryKey: ["mux-asset", params.asset_id],
    queryFn: () => getVideoAsset(params.asset_id),
  });
  const showSkeleton = useDelayedLoading(isLoading);
  const holdSkeleton = isLoading || showSkeleton;

  // Mux is done only when status === "ready"; until then there's no playable stream.
  const isReady = video?.status === "ready";
  const playbackId = video?.playback_ids?.[0]?.id;
  const videoSource =
    isReady && playbackId
      ? `https://stream.mux.com/${playbackId}.m3u8`
      : null;

  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isLandscape = width > height;
  const [showControls, setShowControls] = useState(false);

  // Mirrors of player settings that don't emit their own events,
  // kept in state only so the UI can show the current value.
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const isFocusedRef = useRef(false);

  const {
    data: isSaved,
    isError: isSavedError,
    isFetching: isSavedFetching,
    refetch: refetchSaved,
  } = useQuery({
    queryKey: savedVideoKey(userId, params.asset_id),
    queryFn: () => isVideoSaved(userId, params.asset_id),
    enabled: Boolean(userId && params.asset_id),
  });
  const saveMutation = useMutation({
    mutationFn: (saved: boolean) =>
      setVideoSaved(userId, params.asset_id, saved),
    onSuccess: (saved) => {
      queryClient.setQueryData(
        savedVideoKey(userId, params.asset_id),
        saved,
      );
      void queryClient.invalidateQueries({ queryKey: savedVideosKey(userId) });
    },
    onError: () =>
      Alert.alert("Save failed", "Please check your connection and try again."),
  });

  // Source arrives async (after the query resolves), so create the player empty
  // and load the stream in the effect below — single load path, no double-fetch.
  const player = useVideoPlayer(null, (player) => {
    player.timeUpdateEventInterval = 0.5;
  });

  const sourceLoad = useEvent(player, "sourceLoad", {
    videoSource: null,
    duration: 0,
    availableVideoTracks: [],
    availableSubtitleTracks: [],
    availableAudioTracks: [],
  });
  const { subtitleTrack } = useEvent(player, "subtitleTrackChange", {
    subtitleTrack: player.subtitleTrack,
  });

  useEffect(() => {
    let active = true;
    player.pause();
    player.subtitleTrack = null;
    if (!videoSource) return;

    player
      .replaceAsync({ uri: videoSource, contentType: "hls" })
      .then(() => {
        if (active && isFocusedRef.current) player.play();
      })
      .catch((loadError) => console.warn("video load error", loadError));

    return () => {
      active = false;
      player.pause();
    };
  }, [videoSource, player]);

  useEffect(() => {
    if (sourceLoad.videoSource) player.subtitleTrack = null;
  }, [player, sourceLoad.videoSource]);

  const timeUpdate = useEvent(player, "timeUpdate");
  const currentTime = timeUpdate?.currentTime ?? 0; // seconds

  // Pause whenever this screen loses focus (tab switch, navigating away, etc.)
  useFocusEffect(
    React.useCallback(() => {
      isFocusedRef.current = true;
      return () => {
        isFocusedRef.current = false;
        player.pause();
        setIsFullscreen(false);
        void ScreenOrientation.unlockAsync().catch((orientationError) =>
          console.warn("orientation reset error", orientationError),
        );
      };
    }, [player]),
  );

  const onSeek = (seconds: number) => {
    if (!Number.isFinite(seconds)) return; // ignore NaN / undefined / non-numbers
    player.currentTime = seconds;
  };

  const { isPlaying } = useEvent(player, "playingChange", {
    isPlaying: player.playing,
  });

  const togglePlayPause = () => {
    if (player.playing) {
      player.pause();
    } else {
      player.play();
    }
  };

  const togglePlaybackSpeed = () => {
    const index =
      (playbackSpeedOptions.indexOf(playbackSpeed) + 1) %
      playbackSpeedOptions.length;
    player.playbackRate = playbackSpeedOptions[index];
    setPlaybackSpeed(playbackSpeedOptions[index]);
  };

  const toggleCaptions = () => {
    player.subtitleTrack = subtitleTrack
      ? null
      : (sourceLoad.availableSubtitleTracks[0] ?? null);
  };

  const toggleFullscreen = async () => {
    if (!isFullscreen) {
      await ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.LANDSCAPE_LEFT,
      );
    } else {
      await ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.PORTRAIT_UP,
      );
    }
    setIsFullscreen(!isFullscreen);
  };

  // Gesture callbacks run on the UI thread, so they cross to JS via runOnJS.
  const seekBackward = () => player.seekBy(-10);
  const seekForward = () => player.seekBy(10);
  const toggleControls = () => setShowControls((value) => !value);

  useEffect(() => {
    if (!showControls) return;
    const timer = setTimeout(() => setShowControls(false), 3500);
    return () => clearTimeout(timer);
  }, [showControls]);

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onStart((event) => {
      const mid = width / 2;
      if (event.absoluteX < mid) {
        runOnJS(seekBackward)();
      } else {
        runOnJS(seekForward)();
      }
    });

  const router = useRouter();
  const goBack = () => {
    player.pause();
    if (router.canGoBack()) router.back();
    else router.replace("/(app)");
  };
  const singleTap = Gesture.Tap().onStart(() => runOnJS(toggleControls)());

  const videoPlayer = (
    <View
      style={
        isLandscape
          ? styles.videoContainerLandscape
          : styles.videoContainerPortrait
      }
    >
      {isReady ? (
        <GestureHandlerRootView>
          <GestureDetector gesture={Gesture.Exclusive(doubleTap, singleTap)}>
            <VideoView
              player={player}
              style={styles.video}
              contentFit="contain"
              nativeControls={false}
            />
          </GestureDetector>

          {showControls && (
            <>
              <VideoControls
                captionsEnabled={Boolean(subtitleTrack)}
                onTogglePlayPause={togglePlayPause}
                onTogglePlaybackSpeed={togglePlaybackSpeed}
                onToggleCaptions={
                  sourceLoad.availableSubtitleTracks.length
                    ? toggleCaptions
                    : undefined
                }
                onSeek={onSeek}
                onToggleFullscreen={toggleFullscreen}
                duration={
                  Number.isFinite(player.duration) ? player.duration : 0
                }
                currentTime={currentTime}
                rate={playbackSpeed}
                shouldPlay={isPlaying}
                fullScreenValue={isFullscreen}
              />
              <TouchableOpacity
                accessibilityLabel="Go back"
                accessibilityRole="button"
                style={styles.backButton}
                onPress={goBack}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <Ionicons name="arrow-back" size={28} color="#FFFFFF" />
              </TouchableOpacity>
            </>
          )}
        </GestureHandlerRootView>
      ) : (
        <View style={styles.statusOverlay}>
          <Text style={styles.statusText}>
            {error
              ? "Couldn't load this video."
              : "This video is still being prepared. Check back in a moment."}
          </Text>
          <TouchableOpacity
            accessibilityLabel="Go back"
            accessibilityRole="button"
            style={styles.backButton}
            onPress={goBack}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons name="arrow-back" size={28} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const portraitHeader = (
    <>
      {videoPlayer}
      <View style={styles.metaSection}>
        <Text style={styles.videoTitle} numberOfLines={2}>
          {video?.meta?.title || "Untitled video"}
        </Text>

        {video?.created_at ? (
          <Text style={styles.metaLine}>
            {getRelativeTime(video.created_at)}
          </Text>
        ) : null}

        <View style={styles.creatorRow}>
          <CreatorAvatar
            creator={video?.creator}
            size={40}
            style={styles.avatar}
          />
          <View style={styles.creatorText}>
            <Text numberOfLines={1} style={styles.creatorName}>
              {video?.creator?.name || "Creator"}
            </Text>
            {video?.creator?.description ? (
              <Text numberOfLines={3} style={styles.creatorDescription}>
                {video.creator.description}
              </Text>
            ) : null}
          </View>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity
            accessibilityLabel={
              isSavedError
                ? "Retry loading saved status"
                : isSaved
                  ? "Remove from Library"
                  : "Save to Library"
            }
            accessibilityRole="button"
            accessibilityState={{
              busy: isSavedFetching || saveMutation.isPending,
              disabled: isSavedFetching || saveMutation.isPending,
              selected: Boolean(isSaved),
            }}
            activeOpacity={0.7}
            disabled={isSavedFetching || saveMutation.isPending}
            onPress={() => {
              if (isSavedError) void refetchSaved();
              else saveMutation.mutate(!isSaved);
            }}
            style={[styles.saveButton, isSaved && styles.saveButtonActive]}
          >
            <Ionicons
              name={
                isSavedError
                  ? "refresh-outline"
                  : isSaved
                    ? "bookmark"
                    : "bookmark-outline"
              }
              size={18}
              color={isSaved ? "#000" : "#fff"}
            />
            <Text style={[styles.saveText, isSaved && styles.saveTextActive]}>
              {isSavedError
                ? "Retry"
                : saveMutation.isPending
                  ? "Saving…"
                  : isSaved
                    ? "Saved"
                    : "Save"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
  const videoDetailSkeleton = (
    <VideoDetailSkeleton
      isLandscape={isLandscape}
      onBack={goBack}
      visible={showSkeleton}
    />
  );

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#000",
        paddingTop: isLandscape ? 0 : insets.top,
        paddingLeft: isLandscape ? insets.left : 0,
        paddingRight: isLandscape ? insets.right : 0,
        paddingBottom: isLandscape ? 0 : insets.bottom,
      }}
    >
      {isLandscape ? (
        holdSkeleton ? videoDetailSkeleton : videoPlayer
      ) : (
        <VideoFeed
          key={params.asset_id}
          header={holdSkeleton ? videoDetailSkeleton : portraitHeader}
          title="More videos"
          excludeAssetId={params.asset_id}
          pageSize={8}
          emptyMessage="No more videos yet."
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  videoContainerPortrait: {
    width: "100%",
    aspectRatio: 16 / 9,
    backgroundColor: "#000",
  },
  videoContainerLandscape: {
    flex: 1,
    width: "100%",
    height: "100%",
    backgroundColor: "#000",
  },
  video: {
    width: "100%",
    height: "100%",
  },
  skeletonScreenLandscape: {
    flex: 1,
  },
  skeletonBlock: {
    backgroundColor: "#27272a",
  },
  skeletonMetaSection: {
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  skeletonTitle: {
    width: "78%",
    height: 20,
    borderRadius: 4,
  },
  skeletonMeta: {
    width: "32%",
    height: 12,
    borderRadius: 4,
    marginTop: 10,
  },
  skeletonCreatorRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
  },
  skeletonAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  skeletonCreatorText: {
    flex: 1,
    gap: 7,
    marginLeft: 10,
  },
  skeletonCreatorName: {
    width: "38%",
    height: 14,
    borderRadius: 4,
  },
  skeletonCreatorDescription: {
    width: "68%",
    height: 12,
    borderRadius: 4,
  },
  skeletonActionRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    gap: 10,
    marginTop: 14,
  },
  skeletonSave: {
    width: 88,
    height: 44,
    borderRadius: 22,
  },

  // Shown while Mux is still processing, or on load/error — fills the video box.
  statusOverlay: {
    flex: 1,
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  statusText: {
    color: "#f1f1f1",
    fontSize: 15,
    textAlign: "center",
  },

  // Back button overlay — absolute, sits above the video (transparent bg).
  backButton: {
    position: "absolute",
    top: 8,
    left: 12,
    zIndex: 10,
    minWidth: 44,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },

  // --- YouTube-style metadata + actions (portrait only) ---
  metaSection: {
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  videoTitle: {
    color: "#f1f1f1",
    fontSize: 18,
    fontWeight: "700",
    lineHeight: 24,
  },
  metaLine: {
    color: "#aaaaaa",
    fontSize: 13,
    marginTop: 6,
  },
  creatorRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
  },
  avatar: {
    marginRight: 10,
  },
  creatorText: {
    flex: 1,
  },
  creatorName: {
    color: "#f1f1f1",
    fontSize: 14,
    fontWeight: "700",
  },
  creatorDescription: {
    color: "#aaaaaa",
    fontSize: 12,
    lineHeight: 17,
    marginTop: 2,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
  },
  saveButton: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    borderWidth: 1,
    borderColor: "#3f3f46",
    borderRadius: 22,
    paddingHorizontal: 16,
  },
  saveButtonActive: {
    borderColor: "#f5a100",
    backgroundColor: "#f5a100",
  },
  saveText: {
    color: "#fff",
    fontFamily: "Sora_600SemiBold",
    fontSize: 13,
  },
  saveTextActive: {
    color: "#000",
  },
});
