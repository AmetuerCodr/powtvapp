import { Link } from "expo-router";
import { Text, View } from "react-native";

export default function ExploreScreen() {
  return (
    <View className="justify-center">
      <Text>explore</Text>
      <Link href="/">Go to index</Link>
    </View>
  );
}
