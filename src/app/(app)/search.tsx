import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { Image } from "expo-image";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import SearchBackground from "@/components/search-background";
import { VideoCard } from "@/components/video-feed";
import { getVideoAssets, searchVideoAssets } from "@/utils/getVideoAssets";
import { getPlaylists, type PlaylistData } from "@/utils/playlists";
import { normalizeSearchTerm, type VideoCategory } from "@/utils/search";
import { getPublicPlaybackId } from "@/utils/shorts";

const GOLD = "#E8A020";

const CATEGORIES: {
  category: VideoCategory;
  icon: string;
  iconColor: string;
  label: string;
  tint: string;
}[] = [
  {
    category: "Sermons & Teachings",
    label: "Sermons &\nTeachings",
    icon: "bookmark-outline",
    iconColor: GOLD,
    tint: "rgba(80,50,0,0.45)",
  },
  {
    category: "Wellness & Health",
    label: "Wellness &\nHealth",
    icon: "heart-outline",
    iconColor: "#22C55E",
    tint: "rgba(0,60,20,0.45)",
  },
  {
    category: "Music & Worship",
    label: "Music &\nWorship",
    icon: "music-note",
    iconColor: "#E040FB",
    tint: "rgba(60,0,80,0.45)",
  },
  {
    category: "Courses & Bible Study",
    label: "Courses &\nBible Study",
    icon: "book-open-outline",
    iconColor: "#9B59B6",
    tint: "rgba(30,10,70,0.45)",
  },
  {
    category: "Shorts",
    label: "Shorts",
    icon: "play-circle-outline",
    iconColor: GOLD,
    tint: "rgba(70,40,0,0.45)",
  },
  {
    category: "Guest Creators",
    label: "Guest\nCreators",
    icon: "account-outline",
    iconColor: "#9B59B6",
    tint: "rgba(50,0,80,0.45)",
  },
];

function PlaylistCard({ playlist }: { playlist: PlaylistData }) {
  const firstVideo = playlist.videos[0];
  const playbackId = firstVideo
    ? getPublicPlaybackId(firstVideo.playback_ids)
    : undefined;
  const thumbnailUrl =
    firstVideo?.meta?.thumbnail_url ||
    (playbackId
      ? `https://image.mux.com/${playbackId}/thumbnail.webp`
      : undefined);
  const itemLabel = playlist.isSeries
    ? `${playlist.videos.length} ${playlist.videos.length === 1 ? "episode" : "episodes"}`
    : `${playlist.videos.length} ${playlist.videos.length === 1 ? "video" : "videos"}`;

  return (
    <TouchableOpacity
      accessibilityLabel={`Open ${playlist.name}, ${itemLabel}`}
      accessibilityRole="button"
      activeOpacity={0.8}
      onPress={() =>
        router.push({
          pathname: "/(app)/playlist/[playlist_id]",
          params: { playlist_id: playlist.id },
        })
      }
      style={searchComponentStyle.playlistCard}
    >
      <Image
        cachePolicy="memory-disk"
        contentFit="cover"
        source={
          thumbnailUrl
            ? { uri: thumbnailUrl }
            : require("../../../assets/images/Video.png")
        }
        style={searchComponentStyle.playlistImage}
      />
      <View style={searchComponentStyle.playlistInfo}>
        <Text style={searchComponentStyle.playlistType}>
          {playlist.isSeries ? "SERIES" : "PLAYLIST"}
        </Text>
        <Text numberOfLines={2} style={searchComponentStyle.playlistName}>
          {playlist.name}
        </Text>
        <Text style={searchComponentStyle.playlistCount}>{itemLabel}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function SearchScreen() {
  const { width } = useWindowDimensions();
  const categoryCardWidth = (width - 48) / 2;
  const [query, setQuery] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [featuredId, setFeaturedId] = useState<string | null>(null);

  const {
    data: results = [],
    isError,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["video-search", searchTerm],
    queryFn: () => searchVideoAssets(searchTerm),
    enabled: searchTerm.length > 0,
  });

  const { data: featuredVideos = [], isLoading: isFeaturedLoading } = useQuery({
    queryKey: ["featured-video-options"],
    queryFn: () => getVideoAssets(1, 100),
    enabled: !searchTerm,
  });

  const {
    data: playlists = [],
    isError: isPlaylistError,
    isLoading: isPlaylistLoading,
    refetch: refetchPlaylists,
  } = useQuery({
    queryKey: ["playlists"],
    queryFn: getPlaylists,
    enabled: !searchTerm,
  });

  useEffect(() => {
    if (
      !featuredVideos.length ||
      featuredVideos.some((video) => video.id === featuredId)
    ) {
      return;
    }

    setFeaturedId(
      featuredVideos[Math.floor(Math.random() * featuredVideos.length)].id,
    );
  }, [featuredId, featuredVideos]);

  const featuredVideo = featuredVideos.find((video) => video.id === featuredId);

  const submitSearch = () => {
    setSearchTerm(normalizeSearchTerm(query));
    Keyboard.dismiss();
  };

  const clearSearch = () => {
    setQuery("");
    setSearchTerm("");
  };

  const changeQuery = (value: string) => {
    setQuery(value);
    if (!normalizeSearchTerm(value)) setSearchTerm("");
  };

  const openCategory = (category: VideoCategory) => {
    if (category === "Guest Creators") {
      router.push("/(app)/guest-creators");
      return;
    }

    if (category === "Shorts") {
      router.push("/(app)/watch");
      return;
    }

    router.push({
      pathname: "/(app)/category",
      params: { category },
    });
  };

  return (
    <View style={searchComponentStyle.root}>
      <SearchBackground />
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={searchComponentStyle.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text accessibilityRole="header" style={searchComponentStyle.title}>
            Explore
          </Text>
          <Text style={searchComponentStyle.subtitle}>
            Browse collections, worship, teachings and more
          </Text>

          <View style={searchComponentStyle.searchBar}>
            <Pressable
              accessibilityLabel="Search videos"
              accessibilityRole="button"
              hitSlop={8}
              onPress={submitSearch}
              style={searchComponentStyle.searchButton}
            >
              <MaterialCommunityIcons name="magnify" size={22} color={GOLD} />
            </Pressable>
            <TextInput
              accessibilityLabel="Search videos by title"
              value={query}
              onChangeText={changeQuery}
              onSubmitEditing={submitSearch}
              placeholder="Search video titles"
              placeholderTextColor="rgba(255,255,255,0.35)"
              returnKeyType="search"
              style={searchComponentStyle.searchInput}
            />
            {query.length > 0 && (
              <Pressable
                accessibilityLabel="Clear search"
                accessibilityRole="button"
                hitSlop={8}
                onPress={clearSearch}
              >
                <MaterialCommunityIcons
                  name="close-circle"
                  size={18}
                  color="rgba(255,255,255,0.5)"
                />
              </Pressable>
            )}
          </View>

          {searchTerm ? (
            <View style={searchComponentStyle.results}>
              <Text style={searchComponentStyle.resultsTitle}>
                Results for “{searchTerm}”
              </Text>
              {isLoading ? (
                <View style={searchComponentStyle.state}>
                  <ActivityIndicator color={GOLD} />
                  <Text style={searchComponentStyle.stateText}>
                    Searching videos…
                  </Text>
                </View>
              ) : isError ? (
                <View style={searchComponentStyle.state}>
                  <Text style={searchComponentStyle.stateText}>
                    Search is unavailable right now.
                  </Text>
                  <Pressable
                    accessibilityLabel="Retry video search"
                    accessibilityRole="button"
                    onPress={() => void refetch()}
                    style={searchComponentStyle.retryButton}
                  >
                    <Text style={searchComponentStyle.retryText}>
                      Try again
                    </Text>
                  </Pressable>
                </View>
              ) : results.length ? (
                results.map((video) => (
                  <VideoCard item={video} key={video.id} />
                ))
              ) : (
                <View style={searchComponentStyle.state}>
                  <Text style={searchComponentStyle.stateText}>
                    No videos match “{searchTerm}”.
                  </Text>
                </View>
              )}
            </View>
          ) : (
            <>
              <View style={searchComponentStyle.playlists}>
                <Text
                  accessibilityRole="header"
                  style={searchComponentStyle.sectionTitle}
                >
                  Playlists &amp; series
                </Text>
                {isPlaylistLoading ? (
                  <View style={searchComponentStyle.playlistState}>
                    <ActivityIndicator color={GOLD} />
                  </View>
                ) : isPlaylistError ? (
                  <View style={searchComponentStyle.playlistState}>
                    <Text style={searchComponentStyle.stateText}>
                      Couldn&apos;t load playlists.
                    </Text>
                    <Pressable
                      accessibilityLabel="Retry loading playlists"
                      accessibilityRole="button"
                      onPress={() => void refetchPlaylists()}
                      style={searchComponentStyle.retryButton}
                    >
                      <Text style={searchComponentStyle.retryText}>
                        Try again
                      </Text>
                    </Pressable>
                  </View>
                ) : playlists.length ? (
                  playlists.map((playlist) => (
                    <PlaylistCard key={playlist.id} playlist={playlist} />
                  ))
                ) : (
                  <Text style={searchComponentStyle.emptyPlaylists}>
                    No playlists yet.
                  </Text>
                )}
              </View>
              <Text
                accessibilityRole="header"
                style={searchComponentStyle.sectionTitle}
              >
                Browse by category
              </Text>
              <View style={searchComponentStyle.grid}>
                {CATEGORIES.map((category) => (
                  <TouchableOpacity
                    key={category.category}
                    accessibilityLabel={`Browse ${category.category}`}
                    accessibilityRole="button"
                    activeOpacity={0.8}
                    onPress={() => openCategory(category.category)}
                    style={[
                      searchComponentStyle.cardWrap,
                      { width: categoryCardWidth },
                      { backgroundColor: category.tint },
                    ]}
                  >
                    <Text style={searchComponentStyle.cardLabel}>
                      {category.label}
                    </Text>
                    <MaterialCommunityIcons
                      name={category.icon as any}
                      size={28}
                      color={category.iconColor}
                      style={searchComponentStyle.cardIcon}
                    />
                  </TouchableOpacity>
                ))}
              </View>
              {featuredVideo || isFeaturedLoading || featuredVideos.length ? (
                <View style={searchComponentStyle.featured}>
                  <Text style={searchComponentStyle.featuredTitle}>
                    Featured video
                  </Text>
                  {featuredVideo ? (
                    <VideoCard item={featuredVideo} />
                  ) : (
                    <View style={searchComponentStyle.featuredLoading}>
                      <ActivityIndicator color={GOLD} />
                    </View>
                  )}
                </View>
              ) : null}
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const searchComponentStyle = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingHorizontal: 16, paddingBottom: 40 },

  title: {
    fontFamily: "Sora_700Bold",
    fontSize: 32,
    color: "#fff",
    marginTop: 16,
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: "Sora_400Regular",
    fontSize: 14,
    color: "rgba(255,255,255,0.5)",
    marginBottom: 20,
  },

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
  searchButton: { marginRight: 10 },
  searchInput: {
    flex: 1,
    fontFamily: "Sora_400Regular",
    fontSize: 15,
    color: "#fff",
  },

  playlists: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 12,
    color: "#fff",
    fontFamily: "Sora_700Bold",
    fontSize: 20,
  },
  playlistCard: {
    marginBottom: 18,
  },
  playlistImage: {
    width: "100%",
    aspectRatio: 16 / 9,
    borderRadius: 12,
    backgroundColor: "#27272a",
  },
  playlistInfo: {
    marginTop: 10,
  },
  playlistType: {
    color: GOLD,
    fontFamily: "Sora_600SemiBold",
    fontSize: 11,
    letterSpacing: 1,
  },
  playlistName: {
    marginTop: 3,
    color: "#fafafa",
    fontFamily: "Sora_600SemiBold",
    fontSize: 16,
    lineHeight: 22,
  },
  playlistCount: {
    marginTop: 3,
    color: "#a1a1aa",
    fontFamily: "Sora_400Regular",
    fontSize: 12,
  },
  playlistState: {
    minHeight: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyPlaylists: {
    color: "#a1a1aa",
    fontFamily: "Sora_400Regular",
    fontSize: 14,
  },

  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 24 },
  cardWrap: {
    height: 130,
    borderRadius: 14,
    overflow: "hidden",
    justifyContent: "space-between",
    padding: 14,
  },
  cardLabel: {
    fontFamily: "Sora_600SemiBold",
    fontSize: 15,
    color: "#fff",
    lineHeight: 22,
  },
  cardIcon: { alignSelf: "flex-end" },

  results: { marginHorizontal: -12 },
  resultsTitle: {
    marginHorizontal: 12,
    marginBottom: 12,
    color: "#fff",
    fontFamily: "Sora_600SemiBold",
    fontSize: 17,
  },
  state: {
    minHeight: 140,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  stateText: {
    marginTop: 12,
    color: "rgba(255,255,255,0.6)",
    fontFamily: "Sora_400Regular",
    fontSize: 14,
    textAlign: "center",
  },
  retryButton: {
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  retryText: {
    color: GOLD,
    fontFamily: "Sora_600SemiBold",
    fontSize: 14,
  },

  featured: { marginHorizontal: -12 },
  featuredTitle: {
    marginHorizontal: 12,
    marginBottom: 2,
    fontFamily: "Sora_700Bold",
    fontSize: 20,
    color: "#fff",
  },
  featuredLoading: {
    minHeight: 160,
    alignItems: "center",
    justifyContent: "center",
  },
});
