import { Stack } from "expo-router";

export default function PlaylistLayout() {
  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: "#000" },
        headerShadowVisible: false,
        headerStyle: { backgroundColor: "#000" },
        headerTintColor: "#fff",
        title: "",
      }}
    />
  );
}
