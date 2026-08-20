import { Image } from "expo-image";
import {
  type StyleProp,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from "react-native";

import type { MuxAssetData } from "@/utils/interfaces";

interface CreatorAvatarProps {
  creator?: MuxAssetData["creator"] | null;
  size?: number;
  style?: StyleProp<ViewStyle>;
}

export default function CreatorAvatar({
  creator,
  size = 36,
  style,
}: CreatorAvatarProps) {
  const name = creator?.name?.trim() || "Creator";
  const avatarUrl = creator?.avatar_url?.trim();

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[
        styles.root,
        { borderRadius: size / 2, height: size, width: size },
        style,
      ]}
    >
      <Text style={[styles.initial, { fontSize: size * 0.42 }]}>
        {name.charAt(0).toUpperCase()}
      </Text>
      {avatarUrl ? (
        <Image
          cachePolicy="memory-disk"
          contentFit="cover"
          recyclingKey={creator?.id}
          source={{ uri: avatarUrl }}
          style={[StyleSheet.absoluteFill, { borderRadius: size / 2 }]}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: "center",
    backgroundColor: "#F5A100",
    justifyContent: "center",
    overflow: "hidden",
  },
  initial: {
    color: "#000000",
    fontFamily: "Sora_700Bold",
  },
});
