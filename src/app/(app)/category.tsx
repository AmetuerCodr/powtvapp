import { StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";

import VideoFeed from "@/components/video-feed";
import { isVideoCategory } from "@/utils/search";

export default function CategoryScreen() {
  const params = useLocalSearchParams<{ category?: string | string[] }>();
  const category = Array.isArray(params.category)
    ? params.category[0]
    : params.category;

  if (!isVideoCategory(category)) {
    return (
      <View style={styles.state}>
        <Text style={styles.stateText}>
          That video category is not available.
        </Text>
      </View>
    );
  }

  return (
    <VideoFeed
      category={category}
      emptyMessage={`No videos are available in ${category} yet.`}
      groupShorts={false}
      title={category}
    />
  );
}

const styles = StyleSheet.create({
  state: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#000",
    padding: 24,
  },
  stateText: {
    color: "#a1a1aa",
    fontFamily: "Sora_400Regular",
    fontSize: 14,
    textAlign: "center",
  },
});
