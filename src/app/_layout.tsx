import "../global.css";
import { Stack } from "expo-router";
import { SessionProvider, useSession } from "@/context/auth";

function RootNavigator() {
  const { session, isLoading, isRecovering } = useSession();

  // While restoring auth state keep the screen blank (swap for splash later).
  if (isLoading) return null;

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
      <RootNavigator />
    </SessionProvider>
  );
}
