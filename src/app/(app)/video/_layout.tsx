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


const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  image: { width: 200, height: 200 },
});