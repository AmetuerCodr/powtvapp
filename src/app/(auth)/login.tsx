import { useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  TextInput,
  Image,
  TouchableOpacity,
  Pressable,
} from "react-native";
import { ImageBackground, useImage } from "expo-image";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { useSession } from "@/context/auth";
import { SafeAreaView } from "react-native-safe-area-context";
// import { supabase } from "@/n";
const image = require("../../../assets/images/sign-in.jpg");
const logo = require("../../../assets/images/pow-tv-fulllogo.png");

const GOLD = "#E8A020";
const CARD_BG = "rgba(45, 15, 38, 0.88)";
const INPUT_BG = "rgba(255,255,255,0.08)";
const INPUT_BORDER = "rgba(255,255,255,0.18)";

export default function SignInScreen() {
  // Preload + decode once; ImageBackground gets a ready native ref.
  const bg = useImage(image);
  const { logIn } = useSession();
  const { sendForgotPasswordLink } = useSession();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<
    | "idle"
    | "submitting"
    | "resetSubmitting"
    | "success"
    | "resetSuccess"
    | "error"
  >("idle");
  const [error, setError] = useState("");

  async function forgotPassword(email: string) {
    if (!email) throw new Error("email not found");
    setError("");
    setStatus("resetSubmitting");
    try {
      await sendForgotPasswordLink(email);
      setStatus("resetSuccess");
    } catch (e) {
      setError(e instanceof Error ? e.message : "reset link send failed");
      setStatus("error");
    }
  }

  async function handleLogin() {
    setError("");
    setStatus("submitting");
    try {
      await logIn(email.trim().toLowerCase(), password);
      // success: session set -> guard moves to (app). No navigation here.
    } catch (e) {
      setError(e instanceof Error ? e.message : "Login failed");
      setStatus("error");
    }
  }

  return (
<SafeAreaView className="flex-1" >
      

    <View style={s.container}>
      <ImageBackground source={bg} contentFit="cover" style={s.bg}>
        {/* Logo */}
        <View style={s.logoWrap}>
          <Image source={logo} style={s.logo} resizeMode="contain" />
        </View>

        {/* Card */}
        <View style={s.card}>
          <Text style={s.welcomeBack}>WELCOME BACK</Text>
          <Text style={s.signInTitle}>Log In</Text>
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
              value={email}
              onChangeText={(newEmail) => setEmail(newEmail)}
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
              value={password}
              onChangeText={(newPassword) => setPassword(newPassword)}
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
          <Pressable
            onPress={() => forgotPassword(email)}
            disabled={!email.trim()}
          >
            <Text style={[s.forgot, !email.trim() && s.forgotDisabled]}>
              Forgot Password
            </Text>
          </Pressable>

          {/* Continue */}
          <TouchableOpacity
            style={s.continueBtn}
            activeOpacity={0.85}
            onPress={handleLogin}
            disabled={status === "submitting"}
          >
            <Text style={s.continueBtnText}>
              {status === "submitting" ? "Signing in..." : "Continue"}
            </Text>
          </TouchableOpacity>

          {status === "error" ? <Text style={s.errorText}>{error}</Text> : null}
          {/*{status === "success" ? <Text style={s.successText}>checkr}</Text> : null}*/}
          {status === "resetSuccess" ? (
            <Text style={s.successText}>check your email!</Text>
          ) : null}

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
          <Text style={s.footerText}>New to PowTV?</Text>

          <Pressable>
            <Link href="/signup" style={s.footerLink}>
              Create an Account
            </Link>
          </Pressable>
        </View>
      </ImageBackground>
      </View>
</SafeAreaView>
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
  forgotDisabled: { opacity: 0.4 },

  continueBtn: {
    backgroundColor: GOLD,
    borderRadius: 12,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  continueBtnText: {
    fontFamily: "Sora_700Bold",
    fontSize: 15,
    color: "#fff",
  },
  errorText: {
    fontFamily: "Sora_400Regular",
    fontSize: 13,
    color: "tomato",
    textAlign: "center",
    marginBottom: 8,
  },
  successText: {
    fontFamily: "Sora_400Regular",
    fontSize: 13,
    color: "#34d399",
    textAlign: "center",
    marginBottom: 8,
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
    gap: 7,
  },
  footerText: {
    fontFamily: "Sora_400Regular",
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
  },
  footerLink: {
    fontFamily: "Sora_600SemiBold",
    fontSize: 15,
    color: GOLD,
  },
});
