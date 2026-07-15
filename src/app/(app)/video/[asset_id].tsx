import React, { useEffect, useState } from 'react';
import { MuxAssetData } from '@/utils/interfaces';
import VideoControls from '@/components/VideoControls';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useEvent } from "expo";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import * as ScreenOrientation from "expo-screen-orientation";
// Needed only because gesture callbacks run on the UI thread (see Gestures below).
import { runOnJS } from "react-native-reanimated";

import { Gesture, GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler";


const playbackSpeedOptions = [0.5, 0.75, 1, 1.25, 1.5, 2];

import {Link} from "expo-router"
import { useVideoPlayer, VideoView } from "expo-video";
import { View, Text, StyleSheet, useWindowDimensions, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from '@/utils/supabase';
import { useQuery } from '@tanstack/react-query';

// POWTV brand accents
const GOLD = "#F5A100";
const PINK = "#E14B9A";

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
  const deltaSeconds = Math.round((Date.now() - new Date(isoString).getTime()) / 1000);
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
  const videoSource = playbackId ? `https://stream.mux.com/${playbackId}.m3u8` : null;

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


  // Source arrives async (after the query resolves), so create the player empty
  // and load the stream in the effect below — single load path, no double-fetch.
  const player = useVideoPlayer(null, (player) => {
    player.timeUpdateEventInterval = 0.5;
  });

  useEffect(() => {
    if (!videoSource) return;
    player.replace({ uri: videoSource, contentType: "hls" });
    player.play();
  }, [videoSource, player]);

  const timeUpdate = useEvent(player, "timeUpdate");
    const currentTime = timeUpdate?.currentTime ?? 0; // seconds

  useEffect(() => {
    console.log(player.currentTime)
  }, [player.currentTime])

  // Pause whenever this screen loses focus (tab switch, navigating away, etc.)
  useFocusEffect(
    React.useCallback(() => {
      return () => player.pause();
    }, [player])
  );


  const onSeek = (seconds: number) => {
    if (!Number.isFinite(seconds)) return; // ignore NaN / undefined / non-numbers
    player.currentTime = seconds;
  };

  const { isPlaying } = useEvent(player, "playingChange", {
    isPlaying: player.playing,
  });

  const togglePlayPause = () => {
     player.playing ? player.pause() : player.play();
   };

   const togglePlaybackSpeed = () => {
     const i = (playbackSpeedOptions.indexOf(playbackSpeed) + 1) % playbackSpeedOptions.length;
     player.playbackRate = playbackSpeedOptions[i]; // float, 0–16
     setPlaybackSpeed(playbackSpeedOptions[i]);
   };
 
 
   const toggleFullscreen = async () => {
     if (!isFullscreen) {
       await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE_LEFT);
     } else {
       await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
     }
     setIsFullscreen(!isFullscreen);
   };
 
   // --- Gesture helpers (JS-thread, so the worklets can call them via runOnJS) ---
   const seekBackward = () => player.seekBy(-10); // seconds, relative
   const seekForward = () => player.seekBy(10);
   const toggleControls = () => setShowControls((v) => !v);

   // Auto-hide the controls a few seconds after they appear, so the video
   // stays clean unless the user just interacted with it.
   useEffect(() => {
     if (!showControls) return;
     const timer = setTimeout(() => setShowControls(false), 3500);
     return () => clearTimeout(timer);
   }, [showControls]);
  
   const doubleTap = Gesture.Tap()
     .numberOfTaps(2)
     .onStart((event) => {
       const mid = width / 2;
       event.absoluteX < mid ? runOnJS(seekBackward)() : runOnJS(seekForward)();
     });

  const router = useRouter();
  const singleTap = Gesture.Tap().onStart(() => runOnJS(toggleControls)());
  
  return (
    <View
      style={
        {
            flex: 1,
            backgroundColor: '#000',
            paddingTop: isLandscape ? 0 : insets.top,
            paddingLeft: isLandscape ? insets.left : 0,
            paddingRight: isLandscape ? insets.right : 0,
            paddingBottom: isLandscape ? 0 : insets.bottom,
        }
      }>

      <View
        style={isLandscape
            ? styles.videoContainerLandscape  // flex: 1, fills remaining space after insets
            : styles.videoContainerPortrait   // width: '100%', aspectRatio: 16/9
          }>
        {isReady ? (
        <GestureHandlerRootView >
          <GestureDetector gesture={Gesture.Exclusive(doubleTap, singleTap)}>

          <VideoView
            player={player}
            style={styles.video}
            contentFit="contain"
            nativeControls={false} // hide built-ins; you have custom VideoControls
          />
          </GestureDetector>


          {showControls && (
            <>
              <VideoControls
                onTogglePlayPause={togglePlayPause}
                onTogglePlaybackSpeed={togglePlaybackSpeed}
                onSeek={onSeek}                // seconds
                onToggleFullscreen={toggleFullscreen}
                duration={Number.isFinite(player.duration) ? player.duration : 0}     // seconds — matches duration_seconds in Supabase
                currentTime={currentTime}      // seconds
                rate={playbackSpeed}
                shouldPlay={isPlaying}
                fullScreenValue={isFullscreen}
              />
              <TouchableOpacity
                style={styles.backButton}
                onPress={() =>
                {
                  router.replace("/(app)")
                  if(player.playing) player.pause()
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

      {!isLandscape && (
        <View style={styles.metaSection}>
          {/* Title */}
          <Text style={styles.videoTitle} numberOfLines={2}>
            {video?.meta?.title}
          </Text>

          {/* Meta line: handle · likes · views · time · ...more */}
          <Text style={styles.metaLine} numberOfLines={1}>
            <Text style={styles.metaHandle}>{videoMeta.channel}</Text>
            {`  ${videoMeta.likes} likes  ${videoMeta.views} views  `}
            {video?.created_at ? getRelativeTime(video.created_at) : ""}
            <Text style={styles.metaMore}>  ...more</Text>
          </Text>

          {/* Channel + action icons */}
          <View style={styles.actionRow}>
            {/* Left cluster: avatar + Join + bell */}
            <View style={styles.leftCluster}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {videoMeta.channel.replace("@", "").charAt(0)}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.joinBtn}
                onPress={() => setFollowed((v) => !v)}
                activeOpacity={0.8}
              >
                <Text style={styles.joinText}>{followed ? "Joined" : "Join"}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.bellBtn} activeOpacity={0.8}>
                <Ionicons name="notifications-outline" size={16} color="#fff" />
                <Ionicons name="chevron-down" size={13} color="#fff" style={{ marginLeft: 2 }} />
              </TouchableOpacity>
            </View>

            {/* Right cluster: like · dislike · share · sparkle · more */}
            <View style={styles.rightCluster}>
              <TouchableOpacity
                style={styles.iconBtn}
                onPress={() => setLiked((v) => !v)}
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
      )}


    </View>
  );
}


const styles = StyleSheet.create({
  videoContainerPortrait: {
      width: '100%',
      aspectRatio: 16 / 9,
      backgroundColor: '#000',
    },
    videoContainerLandscape: {
      flex: 1,
      width: '100%',
      height: '100%',
      backgroundColor: '#000',
    },
  video: {
    width: '100%',
    height: '100%'
  },

  // Shown while Mux is still processing, or on load/error — fills the video box.
  statusOverlay: {
    flex: 1,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  statusText: {
    color: '#f1f1f1',
    fontSize: 15,
    textAlign: 'center',
  },

  // Back button overlay — absolute, sits above the video (transparent bg).
  backButton: {
    position: 'absolute',
    top: 8,
    left: 12,
    zIndex: 10,
    padding: 4,
    backgroundColor: 'transparent',
  },

  // --- YouTube-style metadata + actions (portrait only) ---
  metaSection: {
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  videoTitle: {
    color: '#f1f1f1',
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
  },
  metaLine: {
    color: '#aaaaaa',
    fontSize: 13,
    marginTop: 6,
  },
  metaHandle: {
    color: '#aaaaaa',
    fontWeight: '600',
  },
  metaMore: {
    color: '#f1f1f1',
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  leftCluster: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: GOLD,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  avatarText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '800',
  },
  joinBtn: {
    backgroundColor: '#f1f1f1',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 18,
  },
  joinText: {
    color: '#0f0f0f',
    fontSize: 14,
    fontWeight: '700',
  },
  bellBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 18,
    marginLeft: 8,
  },
  rightCluster: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBtn: {
    paddingHorizontal: 3,
    marginLeft: 7,
  },

  // videoVertical: {
  //   width: '100%',
  //   aspectRatio: 16 / 9,
  //   marginTop: '20%'
  // }
  // controlsContainer: {
  //   padding: 10,
  // },
});
