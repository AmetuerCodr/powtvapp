// import React, {useState} from 'react';
// import { View, Text, ScrollView, FlatList, Image, TouchableOpacity, ImageSourcePropType } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';

// // Real YouTube thumbnail, pulled live from the official trailer for Avengers: Doomsday (Dec 18, 2026)
// const heroImage: ImageSourcePropType = { uri: 'https://img.youtube.com/vi/399Ez7WHK5s/maxresdefault.jpg' };


// interface Movie {
//   id: string;
//   image: string;
//   title: string;
//   channel: string;
// }

// interface Category {
//   title: string;
//   data: Movie[];
// }

// // All video IDs below were verified via web search against real, currently-live YouTube videos.
// // Thumbnail URLs use YouTube's public thumbnail CDN pattern: img.youtube.com/vi/{VIDEO_ID}/mqdefault.jpg
// const categories: Category[] = [
//   {
//     title: 'Tech',
//     data: [
//       { id: '1', image: 'https://img.youtube.com/vi/s0yq_9meV_4/mqdefault.jpg', title: 'MKBHD Breaks Down His Biggest Video Ever', channel: 'Marques Brownlee' },
//       { id: '2', image: 'https://img.youtube.com/vi/hLnPciB8cGs/mqdefault.jpg', title: 'Playing Decade-Old Games at Photorealistic Quality', channel: 'Linus Tech Tips' },
//       { id: '3', image: 'https://img.youtube.com/vi/RTZlj4mmpNE/mqdefault.jpg', title: 'I Let my Kids Pick ANY Phone for Christmas', channel: 'Linus Tech Tips' },
//     ],
//   },
//   {
//     title: 'Music',
//     data: [
//       { id: '1', image: 'https://img.youtube.com/vi/ekr2nIex040/mqdefault.jpg', title: 'ROSÉ & Bruno Mars - APT. (Official Music Video)', channel: 'Bruno Mars' },
//       { id: '2', image: 'https://img.youtube.com/vi/kPa7bsKwL-c/mqdefault.jpg', title: 'Lady Gaga, Bruno Mars - Die With A Smile', channel: 'Lady Gaga' },
//     ],
//   },
//   {
//     title: 'Gaming',
//     data: [
//       { id: '1', image: 'https://img.youtube.com/vi/yAi0MYo5Mzw/mqdefault.jpg', title: 'Grand Theft Auto VI - Trailer 2', channel: 'Rockstar Games' },
//       { id: '2', image: 'https://img.youtube.com/vi/wPU4amA6RYk/mqdefault.jpg', title: 'HELLDIVERS 2 - Gameplay Trailer | State of Play 2024', channel: 'PlayStation' },
//     ],
//   },
//   {
//     title: 'Movies',
//     data: [
//       { id: '1', image: 'https://img.youtube.com/vi/ZdC5mFHPldg/mqdefault.jpg', title: 'Mortal Kombat II | Official Trailer', channel: 'Warner Bros. Pictures' },
//       { id: '2', image: 'https://img.youtube.com/vi/UJrghaPJ0RY/mqdefault.jpg', title: 'Scream 7 | Official Trailer', channel: 'Paramount Pictures' },
//     ],
//   },
//   {
//     title: 'DIY',
//     data: [
//       { id: '1', image: 'https://img.youtube.com/vi/33FxTbsszJw/mqdefault.jpg', title: '25 Cool DIYs and Crafts to Make Under 5 Minutes', channel: '5-Minute Crafts' },
//       { id: '2', image: 'https://img.youtube.com/vi/yt6l2NGF0tw/mqdefault.jpg', title: 'Mini Woodworking Bench & Vise Restoration', channel: 'Workshop DIY' },
//     ],
//   },
//   {
//     title: 'Skits',
//     data: [
//       { id: '1', image: 'https://img.youtube.com/vi/sRhTeaa_B98/mqdefault.jpg', title: 'Lazy Sunday - SNL Digital Short', channel: 'Saturday Night Live' },
//       { id: '2', image: 'https://img.youtube.com/vi/rVfS5FTVhDk/mqdefault.jpg', title: 'SNL Digital Short: Doppleganger', channel: 'Saturday Night Live' },
//     ],
//   },
// ];

// interface MovieCardProps {
//   image: string;
//   title: string;
//   channel: string;
// }

// const MovieCard: React.FC<MovieCardProps> = ({ image, title, channel }) => (
//   <TouchableOpacity className="mr-4 w-64">
//     <Image source={{ uri: image }} className="w-full h-36 rounded" />
//     <View className="mt-2">
//       <Text className="text-white font-bold">{title}</Text>
//       <Text className="text-gray-400">{channel}</Text>
//     </View>
//   </TouchableOpacity>
// );

// interface CategoryCarouselProps {
//   title: string;
//   data: Movie[];
// }

// const CategoryCarousel: React.FC<CategoryCarouselProps> = ({ title, data }) => (
//   <View className="mb-8">
//     <Text className="text-white text-xl font-bold mb-4 ml-4">{title}</Text>
//     <FlatList
//       data={data}
//       renderItem={({ item }) => <MovieCard image={item.image} title={item.title} channel={item.channel} />}
//       keyExtractor={(item) => item.id}
//       horizontal
//       showsHorizontalScrollIndicator={false}
//       contentContainerStyle={{ paddingLeft: 16 }}
//     />
//   </View>
// );

// export default function HomeScreen() {
//   const [data, setData] = useState<any>([]);
//   return (
//     <SafeAreaView className="flex-1 bg-black">
     
//     </SafeAreaView>
//   );
// }


// create function to fetch assets from supabase
// write typescript interface to structure data from function
// put it all together in a scrollable feed
// when a user clisk on a thumbnail, it should take them to a deeplink where they can watch the video




import { useInfiniteQuery } from '@tanstack/react-query';
import { ActivityIndicator, RefreshControl, View } from 'react-native';
import { Image } from 'expo-image';
import { useMemo, useCallback, useEffect, useRef } from 'react';
import { FlashList } from '@shopify/flash-list';
import { debounce } from 'lodash';

interface ImageData {
  id: string;
  url: string;
}

interface Page {
  images: ImageData[];
  nextPage: number;
}

const fetchImages = async ({ pageParam = 1 }): Promise<Page> => {
  const images = Array.from({ length: 10 }, (_, index) => ({
    id: `${pageParam}-${index}`,
    url: `https://picsum.photos/300/200?random=${pageParam * 10 + index}`,
  }));
  // Preload images for the next page to reduce flicker
  const nextPageUrls = Array.from({ length: 10 }, (_, index) =>
    `https://picsum.photos/300/200?random=${(pageParam + 1) * 10 + index}`
  );
  Image.prefetch(nextPageUrls);
  return { images, nextPage: pageParam + 1 };
};
export default function ImageGallery() {
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
    getNextPageParam: (lastPage) => lastPage.nextPage,
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

  return (
    <View style={{ flex: 1, backgroundColor: '#000', marginHorizontal: '5%', marginTop: '20%', overflow: 'hidden' }}>
      <FlashList
        data={images}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            tintColor={'#f59e0b'}
            refreshing={isRefetching}
            onRefresh={handleRefresh}
          />
        }
        drawDistance={600}

        renderItem={({ item }) => (
          <Image
            source={{ uri: item.url }}
            style={{ width: '100%', marginVertical: 5, aspectRatio: 16 / 9, borderRadius: 15 }}
            cachePolicy="memory-disk"
            recyclingKey={item.id} // Fix image flickering
            contentFit="cover" // Ensure smooth rendering
            placeholder={{ uri: 'https://via.placeholder.com/300x200' }} // Add placeholder
          />
        )}
        onEndReachedThreshold={1.7}
        onEndReached={handleEndReached}
        ListFooterComponent={
          isFetchingNextPage ? (
            <ActivityIndicator
              color="blue"
              size="small"
              style={{ marginBottom: 5 }}
            />
          ) : null
        }
      />
    </View>
  );
}