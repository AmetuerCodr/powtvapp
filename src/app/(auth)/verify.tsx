import { useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  Pressable,
} from "react-native";
import { ImageBackground, useImage } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { supabase } from "@/utils/supabase";

// Subtle film grain: a light-gray noise texture laid over the near-black
// base at low opacity (see s.noise). Tune opacity to taste.
const noise = require("../../../assets/images/noise.jpg");

const GOLD = "#E8A020";
const BG = "#0B0B0B";

type ResendStatus = "idle" | "sending" | "sent" | "error";

export default function VerifyScreen() {
  // Preload + decode once; ImageBackground gets a ready native ref.
  const bg = useImage(noise);
  const { email } = useLocalSearchParams<{ email?: string }>();
  const [status, setStatus] = useState<ResendStatus>("idle");

  async function handleResend() {
    if (!email || status === "sending") return;
    setStatus("sending");
    const { error } = await supabase.auth.resend({ type: "signup", email });
    setStatus(error ? "error" : "sent");
  }

  return (
    <ImageBackground source={bg} style={s.bg} contentFit="cover">
      {/* Dark dim over the full-gray noise -> only a whisper of grain shows. */}
      <View style={s.dim} />
      <SafeAreaView style={s.safe} edges={["top", "left", "right"]}>
        {/* Back button — no header, no title, per design */}
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          style={s.backBtn}
        >
          <MaterialCommunityIcons name="chevron-left" size={30} color="#fff" />
        </Pressable>

        <View style={s.body}>
          {/* Heading + envelope */}
          <View style={s.headingRow}>
            <Text style={s.heading}>Check your Inbox</Text>
            <MaterialCommunityIcons
              name="email-outline"
              size={26}
              color={GOLD}
              style={s.headingIcon}
            />
          </View>

          <Text style={s.subtitle}>
            We sent a verification link to{" "}
            <Text style={s.email}>{email ?? "your email"}</Text>
          </Text>

          <Text style={s.help}>
            Tap the link in that email to activate your account. You can close
            this screen once you're done.
          </Text>

          {/* Resend */}
          <Pressable onPress={handleResend} style={s.resendWrap}>
            <Text style={s.resend}>
              {status === "sending"
                ? "Sending..."
                : status === "sent"
                  ? "Link sent again"
                  : "didn't receive a link?"}
            </Text>
          </Pressable>

          {status === "error" ? (
            <Text style={s.error}>Couldn't resend. Try again in a moment.</Text>
          ) : null}
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const s = StyleSheet.create({
  bg: { flex: 1, backgroundColor: BG },
  // Darken the full-gray noise to a near-black grain. Lower alpha = more grain.
  dim: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(11,11,11,0.92)",
  },
  safe: { flex: 1 },

  backBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
    marginTop: 4,
  },

  body: { paddingHorizontal: 24, paddingTop: 24 },

  headingRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  heading: {
    fontFamily: "Sora_700Bold",
    fontSize: 30,
    color: "#fff",
  },
  headingIcon: { marginLeft: 10 },

  subtitle: {
    fontFamily: "Sora_400Regular",
    fontSize: 14,
    color: "rgba(255,255,255,0.55)",
    marginBottom: 20,
  },
  email: { fontFamily: "Sora_600SemiBold", color: "rgba(255,255,255,0.85)" },

  help: {
    fontFamily: "Sora_400Regular",
    fontSize: 14,
    lineHeight: 21,
    color: "rgba(255,255,255,0.45)",
    marginBottom: 24,
  },

  resendWrap: { alignSelf: "flex-end" },
  resend: {
    fontFamily: "Sora_700Bold",
    fontSize: 15,
    color: GOLD,
    textDecorationLine: "underline",
  },
  error: {
    fontFamily: "Sora_400Regular",
    fontSize: 13,
    color: "tomato",
    textAlign: "right",
    marginTop: 8,
  },
});
