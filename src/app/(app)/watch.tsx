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
import { View, StyleSheet, Dimensions, useWindowDimensions, Image } from "react-native";


const videoSource =
  "https://stream.mux.com/01YWjOnGB3qF1raEkOXoud00p00jdfyB6PVirtWLTlaqp00.m3u8";


export default function WatchScreen() {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isLandscape = width > height;
  const [showControls, setShowControls] = useState(false);

  

  // Mirrors of player settings that don't emit their own events,
  // kept in state only so the UI can show the current value.
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);


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


{/*
        <Image
             source={require("../../../assets/images/noise.jpg")}
             resizeMode="cover"
             style={[StyleSheet.absoluteFill, { opacity: 0.1 }]}
           />*/}


    
      
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


          <VideoControls
            onTogglePlayPause={togglePlayPause}
            onToggleMute={toggleMute}
            onTogglePlaybackSpeed={togglePlaybackSpeed}
            onSeek={onSeek}                // seconds
            onToggleFullscreen={toggleFullscreen}
            duration={Number.isFinite(player.duration) ? player.duration : 0}     // seconds — matches duration_seconds in Supabase
            currentTime={currentTime}      // seconds
            rate={playbackSpeed}
            isMuted={isMuted}
            shouldPlay={isPlaying}
            fullScreenValue={isFullscreen}
          />
  {/*showControls && */}
        {/*{(
         
        )}*/}
        </GestureHandlerRootView>
      </View>


      {/*{!isLandscape && (
            <View style={[styles.contentContainer, { paddingTop: 0 }]}>

            </View>)}*/}

     
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
  
  // videoVertical: {
  //   width: '100%',
  //   aspectRatio: 16 / 9,
  //   marginTop: '20%'
  // }
  // controlsContainer: {
  //   padding: 10,
  // },
});
