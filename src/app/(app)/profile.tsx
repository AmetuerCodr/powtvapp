import React from "react";
import { useState } from "react";
import { Text, View, Pressable } from "react-native";
import { useSession } from "@/context/auth";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Profile() {
  const { signOut } = useSession();
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [error, setError] = useState("");

  async function handleSignOut() {
    setError("");
    setStatus("submitting");
    try {
      await signOut();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Sign Out failed");
      setStatus("error");
    }
  }

  return (
    <SafeAreaView className="flex-1" >
    <View className="text-white text-lg flex-1 justify-center items-center">
      <Text className="text-white">Profile</Text>
      <Pressable onPress={() => handleSignOut()}>
        <Text className="text-white font-bold">Sign Out</Text>
      </Pressable>
      {status === "error" ? (
        <Text className="text-red-500 text-sm justify-center items-center">
          {error}
        </Text>
      ) : null}
      </View>
    </SafeAreaView>
  );
}
