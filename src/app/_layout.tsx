import "../global.css";
import { useEffect } from "react";
import { SplashScreen, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  useFonts,
  Sora_400Regular,
  Sora_600SemiBold,
  Sora_700Bold,
} from "@expo-google-fonts/sora";
import { SessionProvider, useSession } from "@/context/auth";

SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const { session, isLoading, isRecovering } = useSession();
  // Fonts load once here — registered app-wide, screens just use fontFamily strings.
  const [fontsLoaded] = useFonts({ Sora_400Regular, Sora_600SemiBold, Sora_700Bold });

  const ready = fontsLoaded && !isLoading;
  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  // Splash stays up until fonts + auth state are ready — no white flash.
  if (!ready) return null;

  // A recovery session is authenticated but must stay in (auth) so the user
  // can set a new password — treat it as "not logged in" for routing.
  const loggedIn = !!session && !isRecovering;

  return (
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#000" },
        }}
      >
        <Stack.Protected guard={loggedIn}>
          <Stack.Screen name="(app)" />
        </Stack.Protected>

        <Stack.Protected guard={!loggedIn}>
        <Stack.Screen name="(auth)" />

        </Stack.Protected>
      </Stack>
  );
}

export default function RootLayout() {
  return (
    <SessionProvider>
      <StatusBar style="dark" />
      <RootNavigator />
    </SessionProvider>
  );
}
