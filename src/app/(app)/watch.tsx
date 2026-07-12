import React from "react";
import { Text, View } from "react-native"
import { Link } from "expo-router";
import { getVideoAssets } from "@/utils/getVideoAssets";
import { Pressable } from "react-native-gesture-handler";

export default function Page() {
  return (
    <View className="flex-1 bg-[#000] items-center justify-center" >
      <Pressable
        onPress={() => getVideoAssets()}
      >
        <Text className="text-white" >press to get data from supabase!</Text>
      </Pressable>
      <Link
        href="/(app)/video/4DqIYnSCVfc01oCM00EAlh6NGhC5gTIdGbVm01UPqMkGks"
      >
        <Text className="text-amber-400" >
          View user
        </Text>
      </Link>
   
    </View>
  );
}