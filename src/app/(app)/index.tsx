import { Text, View, StyleSheet } from "react-native";
import { SessionProvider, useSession } from "@/context/auth";
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#18181B",
  },
  text: { color: "#FFFFFF", fontSize: 24, fontWeight: "bold" },
});

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text className="text-red-600">Home</Text>
    </View>
  );
}
