import { Link } from "expo-router";
import { Text, View } from "react-native";

export default function HomeScreen() {
  return (
    <View  className="flex-1 justify-center items-center">
      <Text>index</Text>
      <Link href="/profile">Go to profile</Link>
    </View>
  );
}
