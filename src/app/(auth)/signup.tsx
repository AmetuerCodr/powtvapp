import { useState, useContext } from "react";
import { useSession } from "@/context/auth";
import { supabase } from "../../../utils/supabase";
import {
  Text,
  View,
  ImageBackground,
  StyleSheet,
  TextInput,
  Image,
  TouchableOpacity,
  Pressable,
  Alert,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  useFonts,
  Sora_400Regular,
  Sora_600SemiBold,
  Sora_700Bold,
} from "@expo-google-fonts/sora";

import { Link } from "expo-router";
const image = require("../../../assets/images/sign-in.png");
const logo = require("../../../assets/images/pow-tv-fulllogo.png");

const GOLD = "#E8A020";
const CARD_BG = "rgba(45, 15, 38, 0.88)";
const INPUT_BG = "rgba(255,255,255,0.08)";
const INPUT_BORDER = "rgba(255,255,255,0.18)";

export default function SignInScreen() {
  const { signUp } = useSession();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullname, setFullname] = useState("");
  const [fontsLoaded] = useFonts({
    Sora_400Regular,
    Sora_600SemiBold,
    Sora_700Bold,
  });

  if (!fontsLoaded) return null;
  type Status = "idle" | "submitting" | "error";
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  async function handleSignUp(firstname: string, email: string, password: string) {
    setStatus("submitting");
    const { error: err } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstname,
        }
      }
    });

    if (err) {
      setError(err instanceof Error ? err.message : "Failed");
      setStatus("error");
      return;
    }
    router.replace("/");
  }

  return (
    <View style={s.container}>
      <ImageBackground source={image} resizeMode="cover" style={s.bg}>
        {/* Logo */}
        <View style={s.logoWrap}>
          <Image source={logo} style={s.logo} resizeMode="contain" />
        </View>

        {/* Card */}
        <View style={s.card}>
          <Text style={s.welcomeBack}>WELCOME IN</Text>
          <Text style={s.signInTitle}>Sign Up</Text>
          <Text style={s.subtitle}>Start your journey</Text>

          {/* Full Name */}
          <View style={s.inputRow}>
            <MaterialCommunityIcons
              name="account-box"
              size={20}
              color="rgba(255,255,255,0.5)"
              style={s.inputIcon}
            />
            <TextInput
              placeholder="John Doe"
              value={fullname}
              onChangeText={(newFullName) => setFullname(newFullName)}
              placeholderTextColor="rgba(255,255,255,0.4)"
              keyboardType="default"
              autoCapitalize="none"
              style={s.input}
            />
          </View>

          {/* Email */}
          <View style={s.inputRow}>
            <MaterialCommunityIcons
              name="email"
              size={20}
              color="rgba(255,255,255,0.5)"
              style={s.inputIcon}
            />
            <TextInput
              placeholder="email"
              value={email}
              onChangeText={(newEmail) => setEmail(newEmail)}
              placeholderTextColor="rgba(255,255,255,0.4)"
              keyboardType="email-address"
              style={[s.input, { flex: 1 }]}
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
              autoCapitalize="none"
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

          {/* Continue */}

          <TouchableOpacity
            onPress={() => signUp(fullname, email, password)}
            style={s.continueBtn}
            activeOpacity={0.85}
          >
            <Text style={s.continueBtnText}>Continue</Text>
          </TouchableOpacity>

          {/* Apple */}
          <TouchableOpacity
            onPress={() => Alert.alert("does not currently work yet!")}
            style={s.appleBtn}
            activeOpacity={0.85}
          >
            <MaterialCommunityIcons name="apple" size={22} color="#000" />
            <Text style={s.appleBtnText}>Sign in with Apple</Text>
          </TouchableOpacity>

          {/* Google */}
          <TouchableOpacity
            onPress={() => Alert.alert("does not currently work yet!")}
            style={s.googleBtn}
            activeOpacity={0.85}
          >
            <Text style={s.googleG}>G</Text>
            <Text style={s.googleBtnText}>Sign in with Google</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={s.footer}>
          <Text style={s.footerText}>Have an Account?</Text>
          <Pressable>
            <Link href="/" style={s.footerLink}>
              Sign In
            </Link>
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
