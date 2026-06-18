import React from 'react';
import { View, Text, ScrollView, FlatList, Image, TouchableOpacity, ImageSourcePropType } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Real YouTube thumbnail, pulled live from the official trailer for Avengers: Doomsday (Dec 18, 2026)
const heroImage: ImageSourcePropType = { uri: 'https://img.youtube.com/vi/399Ez7WHK5s/maxresdefault.jpg' };

interface Movie {
  id: string;
  image: string;
  title: string;
  channel: string;
}

interface Category {
  title: string;
  data: Movie[];
}

// All video IDs below were verified via web search against real, currently-live YouTube videos.
// Thumbnail URLs use YouTube's public thumbnail CDN pattern: img.youtube.com/vi/{VIDEO_ID}/mqdefault.jpg
const categories: Category[] = [
  {
    title: 'Tech',
    data: [
      { id: '1', image: 'https://img.youtube.com/vi/s0yq_9meV_4/mqdefault.jpg', title: 'MKBHD Breaks Down His Biggest Video Ever', channel: 'Marques Brownlee' },
      { id: '2', image: 'https://img.youtube.com/vi/hLnPciB8cGs/mqdefault.jpg', title: 'Playing Decade-Old Games at Photorealistic Quality', channel: 'Linus Tech Tips' },
      { id: '3', image: 'https://img.youtube.com/vi/RTZlj4mmpNE/mqdefault.jpg', title: 'I Let my Kids Pick ANY Phone for Christmas', channel: 'Linus Tech Tips' },
    ],
  },
  {
    title: 'Music',
    data: [
      { id: '1', image: 'https://img.youtube.com/vi/ekr2nIex040/mqdefault.jpg', title: 'ROSÉ & Bruno Mars - APT. (Official Music Video)', channel: 'Bruno Mars' },
      { id: '2', image: 'https://img.youtube.com/vi/kPa7bsKwL-c/mqdefault.jpg', title: 'Lady Gaga, Bruno Mars - Die With A Smile', channel: 'Lady Gaga' },
    ],
  },
  {
    title: 'Gaming',
    data: [
      { id: '1', image: 'https://img.youtube.com/vi/yAi0MYo5Mzw/mqdefault.jpg', title: 'Grand Theft Auto VI - Trailer 2', channel: 'Rockstar Games' },
      { id: '2', image: 'https://img.youtube.com/vi/wPU4amA6RYk/mqdefault.jpg', title: 'HELLDIVERS 2 - Gameplay Trailer | State of Play 2024', channel: 'PlayStation' },
    ],
  },
  {
    title: 'Movies',
    data: [
      { id: '1', image: 'https://img.youtube.com/vi/ZdC5mFHPldg/mqdefault.jpg', title: 'Mortal Kombat II | Official Trailer', channel: 'Warner Bros. Pictures' },
      { id: '2', image: 'https://img.youtube.com/vi/UJrghaPJ0RY/mqdefault.jpg', title: 'Scream 7 | Official Trailer', channel: 'Paramount Pictures' },
    ],
  },
  {
    title: 'DIY',
    data: [
      { id: '1', image: 'https://img.youtube.com/vi/33FxTbsszJw/mqdefault.jpg', title: '25 Cool DIYs and Crafts to Make Under 5 Minutes', channel: '5-Minute Crafts' },
      { id: '2', image: 'https://img.youtube.com/vi/yt6l2NGF0tw/mqdefault.jpg', title: 'Mini Woodworking Bench & Vise Restoration', channel: 'Workshop DIY' },
    ],
  },
  {
    title: 'Skits',
    data: [
      { id: '1', image: 'https://img.youtube.com/vi/sRhTeaa_B98/mqdefault.jpg', title: 'Lazy Sunday - SNL Digital Short', channel: 'Saturday Night Live' },
      { id: '2', image: 'https://img.youtube.com/vi/rVfS5FTVhDk/mqdefault.jpg', title: 'SNL Digital Short: Doppleganger', channel: 'Saturday Night Live' },
    ],
  },
];

interface MovieCardProps {
  image: string;
  title: string;
  channel: string;
}

const MovieCard: React.FC<MovieCardProps> = ({ image, title, channel }) => (
  <TouchableOpacity className="mr-4 w-64">
    <Image source={{ uri: image }} className="w-full h-36 rounded" />
    <View className="mt-2">
      <Text className="text-white font-bold">{title}</Text>
      <Text className="text-gray-400">{channel}</Text>
    </View>
  </TouchableOpacity>
);

interface CategoryCarouselProps {
  title: string;
  data: Movie[];
}

const CategoryCarousel: React.FC<CategoryCarouselProps> = ({ title, data }) => (
  <View className="mb-8">
    <Text className="text-white text-xl font-bold mb-4 ml-4">{title}</Text>
    <FlatList
      data={data}
      renderItem={({ item }) => <MovieCard image={item.image} title={item.title} channel={item.channel} />}
      keyExtractor={(item) => item.id}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingLeft: 16 }}
    />
  </View>
);

export default function HomeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-black">
      <ScrollView>
        <View className="relative h-96">
          <Image source={heroImage} className="w-full h-full" />
          <View className="absolute bottom-0 left-0 right-0 p-4 bg-black/50">
            <Text className="text-white text-3xl font-bold">Avengers: Doomsday</Text>
            <Text className="text-white mt-2">
              Only in theaters December 18, 2026.
            </Text>
            <TouchableOpacity className="mt-4 bg-red-600 w-24 py-2 rounded-md items-center">
              <Text className="text-white font-bold">Play</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View className="mt-8">
          {categories.map((category, index) => (
            <CategoryCarousel
              key={index}
              title={category.title}
              data={category.data}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}