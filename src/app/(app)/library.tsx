import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LibraryScreen() {
  return (
    <SafeAreaView className="flex-1">
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#1A1A1A" }}>
      <Text style={{ color: "#FFFFFF" }}>Library</Text>
      </View>
    </SafeAreaView>
  );
}
