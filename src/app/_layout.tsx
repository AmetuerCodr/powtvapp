import { Stack, Redirect } from "expo-router";
import React from "react";
export default function App() {
  return (
    <React.Fragment>
      <Stack
        screenOptions={{
          headerTransparent: true,

          headerTitle: () => null,
          title: "",
          headerShown: false,
          contentStyle: { backgroundColor: "#000" },
        }}
      ></Stack>
    </React.Fragment>
    // <Redirect href="/(app)/search" />
  );
}
