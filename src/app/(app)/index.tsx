import React, { useCallback } from 'react';
import * as ScreenOrientation from "expo-screen-orientation"
import VideoFeed from "@/components/video-feed";
import { useFocusEffect } from 'expo-router';


export default function HomeScreen() {

  useFocusEffect(
    useCallback(() => {
      // 1. Lock the screen orientation to portrait when page is opened
      async function lockOrientation() {
        await ScreenOrientation.lockAsync(
          ScreenOrientation.OrientationLock.PORTRAIT_UP
        );
      }
      lockOrientation();

      // 2. Unlock or reset orientation when user navigates away from the page
      return () => {
        async function unlockOrientation() {
          await ScreenOrientation.unlockAsync(); // Or set to DEFAULT
        }
        unlockOrientation();
      };
    }, [])
  );

  return <VideoFeed />;
}
