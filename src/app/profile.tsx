import React from "react";
import { Text, View } from "react-native";
import { Link } from "expo-router";

export default function Profile(){
  return (
    <View className="flex-1 items-center justify-center">
      <Text>Profile</Text>
      <Link href={"/"}> go to index</Link>
  </View>
  )
}