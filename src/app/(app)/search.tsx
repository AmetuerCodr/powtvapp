import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Pressable,
  ImageBackground,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  useFonts,
  Sora_400Regular,
  Sora_600SemiBold,
  Sora_700Bold,
} from "@expo-google-fonts/sora";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");
const CARD_W = (width - 48) / 2;
const BG_IMAGE = require("../../../assets/images/search-bg.png");

const GOLD = "#E8A020";

const CATEGORIES = [
  { label: "Sermons &\nteachings", icon: "bookmark-outline", iconColor: GOLD,      tint: "rgba(80,50,0,0.45)"   },
  { label: "Wellness &\nHealth",   icon: "heart-outline",     iconColor: "#22C55E", tint: "rgba(0,60,20,0.45)"   },
  { label: "Music &\nWorship",     icon: "music-note",        iconColor: "#E040FB", tint: "rgba(60,0,80,0.45)"   },
  { label: "Courses &\nBible Study",icon: "book-open-outline", iconColor: "#9B59B6", tint: "rgba(30,10,70,0.45)"  },
  { label: "Shorts",               icon: "play-circle-outline",iconColor: GOLD,     tint: "rgba(70,40,0,0.45)"   },
  { label: "Guest\nCreators",      icon: "account-outline",   iconColor: "#9B59B6", tint: "rgba(50,0,80,0.45)"   },
];

export default function SearchScreen() {
  const [query, setQuery] = useState("");
  const [fontsLoaded] = useFonts({ Sora_400Regular, Sora_600SemiBold, Sora_700Bold });
  if (!fontsLoaded) return null;

  return (
    <ImageBackground source={BG_IMAGE} style={s.root} resizeMode="cover">
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={s.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <Text style={s.title}>Search</Text>
          <Text style={s.subtitle}>Find worship, teachings and more</Text>

          {/* Search bar */}
          <View style={s.searchBar}>
            <MaterialCommunityIcons name="magnify" size={22} color={GOLD} style={{ marginRight: 10 }} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Faith over fear"
              placeholderTextColor="rgba(255,255,255,0.35)"
              style={s.searchInput}
            />
            {query.length > 0 && (
              <Pressable onPress={() => setQuery("")}>
                <MaterialCommunityIcons name="close-circle" size={18} color="rgba(255,255,255,0.5)" />
              </Pressable>
            )}
          </View>

          {/* Category grid */}
          <View style={s.grid}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity key={cat.label} activeOpacity={0.8} style={[s.cardWrap, { backgroundColor: cat.tint }]}>
                <Text style={s.cardLabel}>{cat.label}</Text>
                <MaterialCommunityIcons name={cat.icon as any} size={28} color={cat.iconColor} style={s.cardIcon} />
              </TouchableOpacity>
            ))}
          </View>

          {/* Featured */}
          <TouchableOpacity activeOpacity={0.85} style={[s.featuredWrap, { backgroundColor: "rgba(80,5,0,0.7)" }]}>
            <Text style={s.featuredTitle}>
              THE <Text style={{ color: "#CC2200" }}>LOST</Text> PRACTICE
            </Text>
            <Text style={s.featuredSub}>We Desperately Need Again!</Text>
            <View style={s.featuredFooter}>
              <Text style={s.featuredSmall}>TEMPLE OF RADIANT LIGHT</Text>
              <Text style={[s.featuredSmall, { textAlign: "right" }]}>Bishop Shammah{"\n"}Womack-El</Text>
            </View>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingHorizontal: 16, paddingBottom: 40 },

  title: { fontFamily: "Sora_700Bold", fontSize: 32, color: "#fff", marginTop: 16, marginBottom: 4 },
  subtitle: { fontFamily: "Sora_400Regular", fontSize: 14, color: "rgba(255,255,255,0.5)", marginBottom: 20 },

  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: GOLD,
    borderRadius: 30,
    paddingHorizontal: 16,
    height: 50,
    overflow: "hidden",
    marginBottom: 28,
  },
  searchInput: { flex: 1, fontFamily: "Sora_400Regular", fontSize: 15, color: "#fff" },

  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 24 },
  cardWrap: {
    width: CARD_W,
    height: 130,
    borderRadius: 14,
    overflow: "hidden",
    justifyContent: "space-between",
    padding: 14,
  },
  cardLabel: { fontFamily: "Sora_600SemiBold", fontSize: 15, color: "#fff", lineHeight: 22 },
  cardIcon: { alignSelf: "flex-end" },

  featuredWrap: {
    borderRadius: 16,
    overflow: "hidden",
    padding: 20,
    minHeight: 160,
    justifyContent: "space-between",
  },
  featuredTitle: { fontFamily: "Sora_700Bold", fontSize: 26, color: "#fff", letterSpacing: 1 },
  featuredSub: { fontFamily: "Sora_600SemiBold", fontSize: 14, color: "#fff", marginTop: 4 },
  featuredFooter: { flexDirection: "row", justifyContent: "space-between", marginTop: 20 },
  featuredSmall: { fontFamily: "Sora_400Regular", fontSize: 11, color: "rgba(255,255,255,0.65)" },
});
