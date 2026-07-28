import { useState } from "react";
import { Text, View, TextInput, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";


import { supabase } from "@/utils/supabase";
import { useSession } from "@/context/auth";

// POWTV brand kit — Amber variant
const AMBER = "#f5a100";
const AMBER_950 = "#451a03";
const MUTED = "#a1a1aa";

// Sora type scale from the brand kit
const f = {
  h1: { fontFamily: "Sora_700Bold", fontSize: 22 },
  body: { fontFamily: "Sora_400Regular", fontSize: 13 },
  btn: { fontFamily: "Sora_600SemiBold", fontSize: 15 },
};

export default function Reset() {
  // PKCE: the context exchanges the ?code from the deep link and flips
  // isRecovering. We just read it — no token/event detection here.
  const { signOut, isRecovering } = useSession();
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [error, setError] = useState("");

  async function handlePasswordUpdate() {
    if (!newPassword) {
      setError("Enter a new password");
      setStatus("error");
      return;
    }
    setError("");
    setStatus("submitting");
    const { error: err } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (err) {
      setError(err.message);
      setStatus("error");
      return;
    }
    setStatus("idle");
    // Sign out the recovery session + clear isRecovering, then let them log in
    // with the NEW password. (guard sends them to (auth) once session is null.)
    await signOut();
    router.replace("/(auth)/login");
  }

  return (
    <View className="flex-1 bg-[#09090b]">
      <SafeAreaView className="flex-1" edges={["top", "left", "right"]}>
        {/* Back — no header, no title (matches the rest of (auth)) */}
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          className="ml-2 mt-1 h-10 w-10 items-center justify-center"
        >
          <MaterialCommunityIcons
            name="chevron-left"
            size={30}
            color="#fafafa"
          />
        </Pressable>

        {isRecovering ? (
          /* ---------- New-password form ---------- */
          <View className="px-6 pt-6">
            <Text style={f.h1} className="text-[#fafafa] mb-2">
              Set a new password
            </Text>
            <Text style={f.body} className="text-[#a1a1aa] mb-6">
              Choose a strong password for your account.
            </Text>

            <View className="flex-row items-center bg-[#18181b] border border-[#3f3f46] rounded-xl px-3.5 h-[52px] mb-3">
              <MaterialCommunityIcons
                name="lock-outline"
                size={20}
                color={MUTED}
                style={{ marginRight: 10 }}
              />
              <TextInput
                placeholder="New password"
                placeholderTextColor="rgba(250,250,250,0.4)"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                value={newPassword}
                onChangeText={setNewPassword}
                style={{
                  flex: 1,
                  color: "#fafafa",
                  fontFamily: "Sora_400Regular",
                  fontSize: 14,
                }}
              />
              <Pressable
                onPress={() => setShowPassword((v) => !v)}
                className="p-1"
              >
                <MaterialCommunityIcons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color={MUTED}
                />
              </Pressable>
            </View>

            <Pressable
              onPress={handlePasswordUpdate}
              disabled={status === "submitting" || !newPassword}
              className="bg-[#f5a100] rounded-xl h-[52px] items-center justify-center mt-2"
              style={{
                opacity: status === "submitting" || !newPassword ? 0.5 : 1,
              }}
            >
              <Text style={f.btn} className="text-black">
                {status === "submitting" ? "Updating..." : "Update Password"}
              </Text>
            </Pressable>

            {status === "error" ? (
              <Text style={f.body} className="text-[tomato] text-center mt-2">
                {error}
              </Text>
            ) : null}
          </View>
        ) : (
          /* ---------- Branded fallback (no recovery token) ---------- */
          <View className="flex-1 items-center justify-center px-8">
            <View
              className="h-20 w-20 rounded-full items-center justify-center mb-6"
              style={{ backgroundColor: AMBER_950 }}
            >
              <MaterialCommunityIcons
                name="lock-reset"
                size={38}
                color={AMBER}
              />
            </View>
            <Text style={f.h1} className="text-[#fafafa] text-center mb-3">
              Reset link required
            </Text>
            <Text
              style={f.body}
              className="text-[#a1a1aa] text-center mb-8 leading-5"
            >
              Open this screen from the password-reset link we email you.
              Request a fresh one from the login screen.
            </Text>
            <Pressable
              onPress={() => router.replace("/(auth)/login")}
              className="bg-[#f5a100] rounded-xl h-[52px] w-full items-center justify-center"
            >
              <Text style={f.btn} className="text-black">
                Back to login
              </Text>
            </Pressable>
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}
