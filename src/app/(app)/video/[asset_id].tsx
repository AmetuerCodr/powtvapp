import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
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

import VideoControls from "@/components/VideoControls";
import VideoFeed from "@/components/video-feed";
import { MuxAssetData } from "@/utils/interfaces";
import { supabase } from "@/utils/supabase";

// POWTV brand accents
const GOLD = "#F5A100";
const playbackSpeedOptions = [0.5, 0.75, 1, 1.25, 1.5, 2];

// Mockup metadata — swap for real Supabase video record fields later.
const videoMeta = {
  title: "The Amazing Spider-Man",
  channel: "@SonyPictures",
  postedAgo: "14 years ago",
  likes: "39K",
  views: "2M",
};
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

export default function WatchScreen() {
  const params = useLocalSearchParams<{ asset_id: string }>();

  // Fetch this asset's Mux row. react-query is already provided in (app)/_layout.
  const { data: video, isLoading, error } = useQuery({
    queryKey: ["mux-asset", params.asset_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .schema("mux")
        .from("assets")
        .select("*")
        .eq("id", params.asset_id)
        .single();
      if (error) throw error;
      return data as unknown as MuxAssetData; // ponytail: cast Json cols; tighten if meta/playback_ids shape drifts
    },
  });

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

  // Mockup social state
  const [liked, setLiked] = useState(false);
  const [followed, setFollowed] = useState(false);
  const isFocusedRef = useRef(false);

  // Source arrives async (after the query resolves), so create the player empty
  // and load the stream in the effect below — single load path, no double-fetch.
  const player = useVideoPlayer(null, (player) => {
    player.timeUpdateEventInterval = 0.5;
  });

  useEffect(() => {
    let active = true;
    player.pause();
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
                onTogglePlayPause={togglePlayPause}
                onTogglePlaybackSpeed={togglePlaybackSpeed}
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
                style={styles.backButton}
                onPress={() => {
                  player.pause();
                  router.replace("/(app)");
                }}
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
              : isLoading
                ? "Loading…"
                : "This video is still being prepared. Check back in a moment."}
          </Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.replace("/(app)")}
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

        <Text style={styles.metaLine} numberOfLines={1}>
          <Text style={styles.metaHandle}>{videoMeta.channel}</Text>
          {`  ${videoMeta.likes} likes  ${videoMeta.views} views  `}
          {video?.created_at ? getRelativeTime(video.created_at) : ""}
          <Text style={styles.metaMore}>  ...more</Text>
        </Text>

        <View style={styles.actionRow}>
          <View style={styles.leftCluster}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {videoMeta.channel.replace("@", "").charAt(0)}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.joinBtn}
              onPress={() => setFollowed((value) => !value)}
              activeOpacity={0.8}
            >
              <Text style={styles.joinText}>
                {followed ? "Joined" : "Join"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.bellBtn} activeOpacity={0.8}>
              <Ionicons name="notifications-outline" size={16} color="#fff" />
              <Ionicons
                name="chevron-down"
                size={13}
                color="#fff"
                style={styles.bellChevron}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.rightCluster}>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => setLiked((value) => !value)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={liked ? "thumbs-up" : "thumbs-up-outline"}
                size={22}
                color="#fff"
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7}>
              <Ionicons name="thumbs-down-outline" size={22} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7}>
              <Ionicons name="arrow-redo-outline" size={22} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7}>
              <Ionicons name="sparkles-outline" size={22} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7}>
              <Ionicons name="ellipsis-horizontal" size={22} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </>
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
        videoPlayer
      ) : (
        <VideoFeed
          key={params.asset_id}
          header={portraitHeader}
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
    padding: 4,
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
  metaHandle: {
    color: "#aaaaaa",
    fontWeight: "600",
  },
  metaMore: {
    color: "#f1f1f1",
    fontWeight: "600",
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 14,
  },
  leftCluster: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: GOLD,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  avatarText: {
    color: "#000",
    fontSize: 14,
    fontWeight: "800",
  },
  joinBtn: {
    backgroundColor: "#f1f1f1",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 18,
  },
  joinText: {
    color: "#0f0f0f",
    fontSize: 14,
    fontWeight: "700",
  },
  bellBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 18,
    marginLeft: 8,
  },
  bellChevron: {
    marginLeft: 2,
  },
  rightCluster: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconBtn: {
    paddingHorizontal: 3,
    marginLeft: 7,
  },
});
