import React from "react";
import { Text, View } from "react-native"
import { Link } from "expo-router";

export default function Page() {
  return (
    <View className="flex-1 bg-[#000] items-center justify-center" >
      <Link
        href="/(app)/video/aT6jE5Q8jZ2RZow01LwSpz2oYNw72kye02gYUP4re01SA4"
      >
        <Text className="text-amber-400" >
          View user
        </Text>
      </Link>
    </View>
  );
}