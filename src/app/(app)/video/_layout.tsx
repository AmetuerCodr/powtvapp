import { Stack } from "expo-router";


export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false, // default: no header anywhere
        headerTintColor: "#FFFFFF",

      }}
    >
      {/*<Stack.Screen
        name="[asset_id]" // file is video/[asset_id].tsx -> route name is just "[asset_id]"
        options={{
          headerShown: true, // turn header back on just here
          headerTitle: "", // optional: hide title text, keep back button
          headerStyle: { backgroundColor: "#18181B" },
          headerTintColor: "#FFFFFF",
        }}
      />*/}
    </Stack>
  );
}