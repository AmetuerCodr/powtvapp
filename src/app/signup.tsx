import React from "react";
import { Text, View } from "react-native";
import { Link } from "expo-router";
import { Layout, Typography } from '@/styles';

export default function Profile(){
  return (
    <View style={{flex: 1, justifyContent: "center", alignItems: "center"}}>
      <Text >Welcome to POWTV</Text>
      <Link href={"/"} > Sign up </Link>
  </View>
  )
}