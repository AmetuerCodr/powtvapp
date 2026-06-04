import React from "react";
import { Text, View, Pressable } from "react-native";


export default function Profile() {
  return (
    <View className="text-white text-lg flex-1 justify-center items-center">
      <Text className="text-white" >Profile</Text>
      <Pressable >
        <TextclassName="text-white text-lg" > sign out</Text>
      </Pressable>
    </View>
  );
}
