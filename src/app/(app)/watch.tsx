import React, { useEffect, useState } from 'react';
import VideoControls from '@/components/VideoControls';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEvent } from "expo";

// Needed only because gesture callbacks run on the UI thread (see Gestures below).
import { runOnJS } from "react-native-reanimated";

import { Gesture, GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler";
import * as ScreenOrientation from "expo-screen-orientation";

const playbackSpeedOptions = [0.5, 0.75, 1, 1.25, 1.5, 2];

import { useVideoPlayer, VideoView } from "expo-video";
import { View, Text, StyleSheet, Dimensions, useWindowDimensions, Image, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

// POWTV brand accents
const GOLD = "#F5A100";
const PINK = "#E14B9A";

const videoSource =
  "https://stream.mux.com/01YWjOnGB3qF1raEkOXoud00p00jdfyB6PVirtWLTlaqp00.m3u8";

// Mockup metadata — swap for real Supabase video record fields later.
const videoMeta = {
  title: "The Amazing Spider-Man",
  channel: "@SonyPictures",
  postedAgo: "14 years ago",
};

// One social action (Like / Share / Follow) — gold-ringed pink circle + label.
const ActionButton = ({
  icon,
  label,
  active,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  active?: boolean;
  onPress: () => void;
}) => (
  <TouchableOpacity style={styles.action} onPress={onPress} activeOpacity={0.8}>
    <View style={[styles.actionCircle, active && styles.actionCircleActive]}>
      <Ionicons name={icon} size={22} color="#fff" />
    </View>
    <Text style={styles.actionLabel}>{label}</Text>
  </TouchableOpacity>
);


export default function WatchScreen() {
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


  const player = useVideoPlayer({uri: videoSource, contentType: 'hls'}, (player) => {
    player.timeUpdateEventInterval = 0.5;
  });

  const timeUpdate = useEvent(player, "timeUpdate");
    const currentTime = timeUpdate?.currentTime ?? 0; // seconds

  useEffect(() => {
    console.log(player.currentTime)
  }, [player.currentTime])


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
          }
    >
        

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
          )}
        </GestureHandlerRootView>
      </View>


      {!isLandscape && (
        <View style={styles.infoBar}>
          <View style={styles.infoLeft}>
            <Text style={styles.videoTitle} numberOfLines={2}>
              {videoMeta.title}
            </Text>
            <View style={styles.channelRow}>
              <View style={styles.channelLogo}>
                <Text style={styles.channelLogoText}>
                  {videoMeta.channel.replace("@", "").charAt(0)}
                </Text>
              </View>
              <Text style={styles.channelName}>{videoMeta.channel}</Text>
              <Text style={styles.dot}>•</Text>
              <Text style={styles.timestamp}>{videoMeta.postedAgo}</Text>
            </View>
          </View>

          <View style={styles.actionsRow}>
            <ActionButton
              icon={liked ? "heart" : "heart-outline"}
              label="Like"
              active={liked}
              onPress={() => setLiked((v) => !v)}
            />
            <ActionButton
              icon="share-social"
              label="Share"
              onPress={() => {}}
            />
            <ActionButton
              icon={followed ? "checkmark" : "person-add"}
              label={followed ? "Following" : "Follow"}
              active={followed}
              onPress={() => setFollowed((v) => !v)}
            />
          </View>
        </View>
      )}



      <View>
        <Text style={{color: 'white', fontSize: 20}}  >
          Insert Video Feed here!
        </Text>
      </View>

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

  // --- Mockup metadata + social actions (portrait only) ---
  infoBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  infoLeft: {
    flex: 1,
    paddingRight: 12,
  },
  videoTitle: {
    color: '#fafaf9',
    fontSize: 18,
    fontWeight: '700',
  },
  channelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  channelLogo: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: GOLD,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  channelLogoText: {
    color: '#000',
    fontSize: 12,
    fontWeight: '800',
  },
  channelName: {
    color: '#B0B4BA',
    fontSize: 13,
    fontWeight: '600',
  },
  dot: {
    color: '#B0B4BA',
    fontSize: 13,
    marginHorizontal: 6,
  },
  timestamp: {
    color: '#B0B4BA',
    fontSize: 13,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  action: {
    alignItems: 'center',
    marginLeft: 14,
  },
  actionCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: PINK,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionCircleActive: {
    backgroundColor: GOLD,
  },
  actionLabel: {
    color: '#B0B4BA',
    fontSize: 12,
    marginTop: 5,
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
