import { useInfiniteQuery } from '@tanstack/react-query';
import { ActivityIndicator, RefreshControl, View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { useMemo, useCallback } from 'react';
import { FlashList } from '@shopify/flash-list';
import { debounce } from 'lodash';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import {
  useFonts,
  Sora_400Regular,
  Sora_600SemiBold,
  Sora_700Bold,
} from '@expo-google-fonts/sora';
import { getVideoAssets } from '@/utils/getVideoAssets';
import { MuxAssetData } from '@/utils/interfaces';
// fetch videos and use flashlist to iterate over youtube-style cards.

// --- POWTV brand kit (amber variant) ---
const COLORS = {
  bgBase: '#000000',
  bgElevated: '#27272a',
  border: '#3f3f48',
  amber500: '#f5a100',
  amber950: '#451a03',
  textPrimary: '#fafafa',
  textMuted: '#a1a1aa',
};

// Dummy channel / metadata to fill the YouTube-app layout — swap for real
// Supabase fields once they exist. Keyed by list index so each card is stable.
const CHANNELS = [
  { name: 'Bishop Womack-El', category: 'Sermons' },
  { name: 'Temple of Radiant Light', category: 'Wellness' },
  { name: 'POW Worship', category: 'Music' },
  { name: 'Prophet of Wellness', category: 'Courses' },
];
const META = [
  { views: '1.2M', ago: '3 days ago', duration: '12:34', percent: 0.55 },
  { views: '48K', ago: '1 week ago', duration: '8:07', percent: 0.2 },
  { views: '213K', ago: '2 months ago', duration: '45:19', percent: 0 },
  { views: '9.8K', ago: 'yesterday', duration: '3:42', percent: 0.85 },
];

interface Page {
  images: MuxAssetData[];
  nextPage: number;
}

const PAGE_SIZE = 15;

const fetchImages = async ({ pageParam = 1 }): Promise<Page> => {
  const assets = await getVideoAssets(pageParam);
  const images: MuxAssetData[] = Array.isArray(assets) ? assets : [];
  // Only a full page can have a next page — skip the prefetch (and the extra
  // empty query) once we've hit the last page.
  if (images.length === PAGE_SIZE) {
    const nextPageAssets = await getVideoAssets(pageParam + 1);
    const nextPageUrls = Array.isArray(nextPageAssets)
      ? nextPageAssets.map((asset) => asset.meta.thumbnail_url)
      : [];
    Image.prefetch(nextPageUrls);
  }
  return { images, nextPage: pageParam + 1 };
};

function VideoCard({ item, index }: { item: MuxAssetData; index: number }) {
  const channel = CHANNELS[index % CHANNELS.length];
  const meta = META[index % META.length];
  return (
    <Link href={{
      pathname: "/(app)/video/[asset_id]",
      params: {asset_id: item.id}
    }} >
    <View style={styles.card}>
      {/* Thumbnail — cropped 16:9 like a YouTube thumbnail */}
      <View style={styles.thumbWrap}>
        <Image
          source={{ uri: item.meta.thumbnail_url || `https://image.mux.com/${item.playback_ids[0].id}/thumbnail.webp` }}
          style={styles.thumb}
          cachePolicy="memory-disk"
          recyclingKey={item.id} // Fix image flickering
          contentFit="cover" // crop to 16:9, drop letterbox bars
        />
        {/* Category badge — amber, top-left */}
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{channel.category}</Text>
        </View>
        {/* Duration pill — bottom-right */}
        <View style={styles.durationPill}>
          <Text style={styles.durationText}>{meta.duration}</Text>
        </View>
        {/* Watched progress — amber, bottom edge */}
        {meta.percent > 0 && (
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${meta.percent * 100}%` }]} />
          </View>
        )}
      </View>

      {/* Info row — avatar + title + metadata (YouTube app format) */}
      <View style={styles.infoRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{channel.name.charAt(0)}</Text>
        </View>
        <View style={styles.infoText}>
          <Text style={styles.title} numberOfLines={2}>
            {item.meta.title}
          </Text>
          <Text style={styles.metaLine} numberOfLines={1}>
            {`${channel.name} • ${meta.views} views • ${meta.ago}`}
          </Text>
        </View>
      </View>
      </View>
    </Link>
  );
}

export default function ImageGallery() {
  const [fontsLoaded] = useFonts({ Sora_400Regular, Sora_600SemiBold, Sora_700Bold });

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isRefetching,
  } = useInfiniteQuery({
    queryKey: ['images'],
    initialPageParam: 1,
    queryFn: fetchImages,
    getNextPageParam: (lastPage) =>
      lastPage.images.length === PAGE_SIZE ? lastPage.nextPage : undefined,
  });

  const images = useMemo(
    () => data?.pages.flatMap((page) => page.images) || [],
    [data]
  );

  const handleEndReached = useCallback(
    debounce(() => {
      if (hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    }, 300),
    [hasNextPage, isFetchingNextPage, fetchNextPage]
  );

  const handleRefresh = () => {
    // handleEndReached();
    console.log("refrehing the page!");
  }

  if (!fontsLoaded) return null;

  return (
    <SafeAreaView style={styles.root} edges={[]}>
      <FlashList
        data={images}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            tintColor={COLORS.amber500}
            refreshing={isRefetching}
            onRefresh={handleRefresh}
          />
        }
        drawDistance={600}
        renderItem={({ item, index }) => <VideoCard item={item} index={index} />}
        onEndReachedThreshold={1.7}
        onEndReached={handleEndReached}
        ListFooterComponent={
          isFetchingNextPage ? (
            <ActivityIndicator
              color={COLORS.amber500}
              size="small"
              style={{ marginVertical: 12 }}
            />
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.bgBase,
  },
  listContent: {
    paddingHorizontal: 12,
    paddingBottom: 20,
  },
  card: {
    marginBottom: 20,
  },
  thumbWrap: {
    width: '100%',
    aspectRatio: 16 / 9,
    marginVertical: 10,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: COLORS.bgElevated,
  },
  thumb: {
    width: '100%',
    height: '100%',
  },
  badge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: COLORS.amber950,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    fontFamily: 'Sora_600SemiBold',
    fontSize: 9,
    color: COLORS.amber500,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  durationPill: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  durationText: {
    fontFamily: 'Sora_400Regular',
    fontSize: 11,
    color: COLORS.textPrimary,
  },
  progressTrack: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  progressFill: {
    height: 3,
    backgroundColor: COLORS.amber500,
  },
  infoRow: {
    flexDirection: 'row',
    marginTop: 12,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.amber500,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontFamily: 'Sora_700Bold',
    fontSize: 16,
    color: COLORS.bgBase,
  },
  infoText: {
    flex: 1,
  },
  title: {
    fontFamily: 'Sora_600SemiBold',
    fontSize: 15,
    lineHeight: 20,
    color: COLORS.textPrimary,
  },
  metaLine: {
    fontFamily: 'Sora_400Regular',
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 4,
  },
});
