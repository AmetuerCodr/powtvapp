import { useState } from "react";
import {
  Text,
  View,
  ImageBackground,
  StyleSheet,
  TextInput,
  Image,
  TouchableOpacity,
  Pressable,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  useFonts,
  Sora_400Regular,
  Sora_600SemiBold,
  Sora_700Bold,
} from "@expo-google-fonts/sora";

const image = require("../../assets/images/sign-in.png");
const logo = require("../../assets/images/pow-tv-fulllogo.png");

const GOLD = "#E8A020";
const CARD_BG = "rgba(45, 15, 38, 0.88)";
const INPUT_BG = "rgba(255,255,255,0.08)";
const INPUT_BORDER = "rgba(255,255,255,0.18)";

export default function SignInScreen() {
  const [showPassword, setShowPassword] = useState(false);
  const [fontsLoaded] = useFonts({
    Sora_400Regular,
    Sora_600SemiBold,
    Sora_700Bold,
  });

  if (!fontsLoaded) return null;

  return (
    <View style={s.container}>
      <ImageBackground source={image} resizeMode="cover" style={s.bg}>
        {/* Logo */}
        <View style={s.logoWrap}>
          <Image source={logo} style={s.logo} resizeMode="contain" />
        </View>

        {/* Card */}
        <View style={s.card}>
          <Text style={s.welcomeBack}>WELCOME BACK</Text>
          <Text style={s.signInTitle}>Sign In</Text>
          <Text style={s.subtitle}>Continue your journey</Text>

          {/* Email */}
          <View style={s.inputRow}>
            <MaterialCommunityIcons
              name="email-outline"
              size={20}
              color="rgba(255,255,255,0.5)"
              style={s.inputIcon}
            />
            <TextInput
              placeholder="johndoe@example.com"
              placeholderTextColor="rgba(255,255,255,0.4)"
              keyboardType="email-address"
              autoCapitalize="none"
              style={s.input}
            />
          </View>

          {/* Password */}
          <View style={s.inputRow}>
            <MaterialCommunityIcons
              name="lock-outline"
              size={20}
              color="rgba(255,255,255,0.5)"
              style={s.inputIcon}
            />
            <TextInput
              placeholder="password"
              placeholderTextColor="rgba(255,255,255,0.4)"
              secureTextEntry={!showPassword}
              style={[s.input, { flex: 1 }]}
            />
            <Pressable
              onPress={() => setShowPassword((v) => !v)}
              style={s.eyeBtn}
            >
              <MaterialCommunityIcons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={20}
                color="rgba(255,255,255,0.5)"
              />
            </Pressable>
          </View>

          {/* Forgot */}
          <Text style={s.forgot}>Forgot Password</Text>

          {/* Apple */}
          <TouchableOpacity style={s.appleBtn} activeOpacity={0.85}>
            <MaterialCommunityIcons name="apple" size={22} color="#000" />
            <Text style={s.appleBtnText}>Sign in with Apple</Text>
          </TouchableOpacity>

          {/* Google */}
          <TouchableOpacity style={s.googleBtn} activeOpacity={0.85}>
            <Text style={s.googleG}>G</Text>
            <Text style={s.googleBtnText}>Sign in with Google</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={s.footer}>
          <Text style={s.footerText}>New to PowTV? </Text>
          <Pressable>
            <Text style={s.footerLink}>Create an Account</Text>
          </Pressable>
        </View>
      </ImageBackground>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  bg: { flex: 1, justifyContent: "space-between", paddingBottom: 40 },

  logoWrap: { alignItems: "center", paddingTop: 70 },
  logo: { width: 320, height: 180 },

  card: {
    width: "88%",
    alignSelf: "center",
    backgroundColor: CARD_BG,
    borderRadius: 24,
    padding: 24,
    marginTop: 32,
  },

  welcomeBack: {
    fontFamily: "Sora_600SemiBold",
    fontSize: 11,
    letterSpacing: 2,
    color: GOLD,
    marginBottom: 6,
  },
  signInTitle: {
    fontFamily: "Sora_700Bold",
    fontSize: 28,
    color: "#fff",
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: "Sora_400Regular",
    fontSize: 13,
    color: "rgba(255,255,255,0.5)",
    marginBottom: 24,
  },

  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: INPUT_BG,
    borderWidth: 1,
    borderColor: INPUT_BORDER,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 52,
    marginBottom: 12,
  },
  inputIcon: { marginRight: 10 },
  input: {
    flex: 1,
    fontFamily: "Sora_400Regular",
    fontSize: 14,
    color: "#fff",
  },
  eyeBtn: { padding: 4 },

  forgot: {
    fontFamily: "Sora_400Regular",
    fontSize: 12,
    color: GOLD,
    textAlign: "right",
    marginBottom: 20,
    letterSpacing: 0.5,
  },

  appleBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    height: 52,
    marginBottom: 12,
    gap: 10,
  },
  appleBtnText: {
    fontFamily: "Sora_600SemiBold",
    fontSize: 15,
    color: "#000",
  },

  googleBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    height: 52,
    gap: 10,
  },
  googleG: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4285F4",
  },
  googleBtnText: {
    fontFamily: "Sora_600SemiBold",
    fontSize: 15,
    color: "#333",
  },

  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
  },
  footerText: {
    fontFamily: "Sora_400Regular",
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
  },
  footerLink: {
    fontFamily: "Sora_600SemiBold",
    fontSize: 14,
    color: GOLD,
  },
});
