import React, { useEffect, useState } from 'react';
import VideoControls from '@/components/VideoControls';
import { useEvent } from "expo";

// Needed only because gesture callbacks run on the UI thread (see Gestures below).
import { runOnJS } from "react-native-reanimated";


import { Gesture, GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler";
import * as ScreenOrientation from "expo-screen-orientation";

const playbackSpeedOptions = [0.5, 0.75, 1, 1.25, 1.5, 2];


import { useVideoPlayer, VideoView } from "expo-video";
import { View, StyleSheet, Button, Pressable, Text, Dimensions } from "react-native";

const videoSource =
  "https://stream.mux.com/01YWjOnGB3qF1raEkOXoud00p00jdfyB6PVirtWLTlaqp00.m3u8";



export default function WatchScreen() {

  const [showControls, setShowControls] = useState(false);

  // Mirrors of player settings that don't emit their own events,
  // kept in state only so the UI can show the current value.
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const player = useVideoPlayer(videoSource, (player) => {
player.timeUpdateEventInterval = 0.5;
  });

  const timeUpdate = useEvent(player, "timeUpdate");
    const currentTime = timeUpdate?.currentTime ?? 0; // seconds

  useEffect(() => {
    console.log(player.currentTime)
  }, [player.currentTime])

  const { isPlaying } = useEvent(player, "playingChange", {
    isPlaying: player.playing,
  });

  const togglePlayPause = () => {
     player.playing ? player.pause() : player.play();
   };
 
   const toggleMute = () => {
     const next = !isMuted;
     player.muted = next;
     setIsMuted(next);
   };
 
   const togglePlaybackSpeed = () => {
     const i = (playbackSpeedOptions.indexOf(playbackSpeed) + 1) % playbackSpeedOptions.length;
     player.playbackRate = playbackSpeedOptions[i]; // float, 0–16
     setPlaybackSpeed(playbackSpeedOptions[i]);
   };
 
   const onSeek = (seconds: number) => {
     player.currentTime = seconds; // slider and player are both in seconds
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
 
   const doubleTap = Gesture.Tap()
     .numberOfTaps(2)
     .onStart((event) => {
       const mid = Dimensions.get("screen").width / 2;
       event.absoluteX < mid ? runOnJS(seekBackward)() : runOnJS(seekForward)();
     });
 
   const singleTap = Gesture.Tap().onStart(() => runOnJS(toggleControls)());

  
  return (
    <View style={styles.contentContainer}>
      <VideoView
      nativeControls={true}
        style={styles.video}
        player={player}
        fullscreenOptions={{ enable: true }}
        allowsPictureInPicture
      />
      {showControls && (
        <VideoControls
          onTogglePlayPause={togglePlayPause}
          onPlayPreviousVideo={playPreviousVideo}
          onPlayNextVideo={playNextVideo}
          onToggleMute={toggleMute}
          onTogglePlaybackSpeed={togglePlaybackSpeed}
          onSeek={(value) => {
            videoRef.current.currentTime = value / 1000; // expo-video uses seconds
            setCurrentTime(value);
          }}
          onToggleFullscreen={toggleFullscreen}
          duration={duration * 1000}        // from your assets table, converted to ms
          currentTime={currentTime}
          rate={playbackSpeed}
          isMuted={isMuted}
          shouldPlay={isPlaying}
          fullScreenValue={isFullscreen}
        />
      )}
      {/*<View style={styles.controlsContainer}>
        <Pressable
          onPress={() => {
            if (isPlaying) {
              player.pause();
            } else {
              player.play();
            }
          }}
        >
          <Text>{isPlaying ? "Pause" : "Play"}</Text>
        </Pressable>
      </View>*/}
    </View>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 50,
  },
  video: {
    width: 350,
    height: 275,
  },
  controlsContainer: {
    padding: 10,
  },
});
