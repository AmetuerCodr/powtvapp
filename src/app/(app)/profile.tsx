import React from "react";
import { Text, View, Pressable } from "react-native";
import { useSession } from "@/context/auth";

export default function Profile() {
  const { signOut } = useSession();
  return (
    <View className="text-white text-lg flex-1 justify-center items-center">
      <Text className="text-white">Profile</Text>
      <Pressable onPress={() => signOut()}>
        <Text className="text-white font-bold">Sign Out</Text>
      </Pressable>
    </View>
  );
}
