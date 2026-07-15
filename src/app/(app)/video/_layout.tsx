import { Stack } from "expo-router";
import { Image } from "expo-image"
import { StyleSheet, View } from "react-native";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false, // default: no header anywhere
        headerTintColor: "#FFFFFF",

      }}
    >
      {/* file is video/[asset_id].tsx -> route name is just "[asset_id]".
          dangerouslySingular: keep only ONE video screen in the stack — switching
          videos replaces it instead of piling A→B→C onto the (persistent) stack. */}
      <Stack.Screen name="[asset_id]" dangerouslySingular />
    </Stack>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  image: { width: 200, height: 200 },
});