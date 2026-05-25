import React from "react";
import { Text, View } from "react-native";
import { Link } from "expo-router";

export default function Profile(){
  return (
    <View>
      <Text>Profile</Text>
      <Link href={"/"}> go home</Link>
  </View>
  )
}