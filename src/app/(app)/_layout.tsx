import { Tabs } from "expo-router";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Home from "@/components/icons/Home";
import Search from "@/components/icons/Search";
import Watch from "@/components/icons/Watch";
import Library from "@/components/icons/Library";
import Profile from "@/components/icons/Profile";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 10,
    }
  }
})


const HEADER_ROW = 48; // logo row height (dp) below the status bar

export default function AppTabs() {
  const insets = useSafeAreaInsets();
  return (
     <GestureHandlerRootView style={{ flex: 1 }}>
    <QueryClientProvider client={queryClient}>
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#FFFFFF",
        tabBarInactiveTintColor: "#6B7280",
        tabBarStyle: {
          backgroundColor: "#18181B",
          borderTopWidth: 0,
        },
        sceneStyle: { backgroundColor: "#000" },
        headerShown: false,
        headerTintColor: "#FFFFFF",
      }}
    >
      <Tabs.Screen
        name="index"
            options={{
              headerShown: true,
              headerStyle: { backgroundColor: "#000", height: insets.top + HEADER_ROW, },
              headerStatusBarHeight: insets.top,
              headerTitleAlign: 'center',
              headerTitleContainerStyle: { marginHorizontal: 12, alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 8 },
              headerTitle: () => (
                <Image
                  source={require('../../../assets/images/pow-tv-logo-trimmed.png')}
                  style={{ width: 156, height: 56 }}
                  contentFit="contain"
                />
            ),
          title: "Home",

          // tabBarStyle: { display: "none" },
          tabBarIcon: ({ color, size }) => (
            <Home width={size} height={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Explore",
          tabBarIcon: ({ color, size }) => (
            <Search width={size} height={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="watch"
        options={{
          title: "Shorts",
          tabBarIcon: ({ color, size }) => (
            <Watch width={size} height={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: "Library",
          tabBarIcon: ({ color, size }) => (
            <Library width={size} height={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ size }) => <Profile width={size} height={size} />,
        }}
      />
      
        <Tabs.Screen
          name="category"
          options={{
            href: null,
            headerShown: true,
            headerStyle: { backgroundColor: "#000" },
            title: "Browse",
          }}
        />
        <Tabs.Screen
          name="guest-creators"
          options={{
            href: null,
            headerShown: true,
            headerStyle: { backgroundColor: "#000" },
            title: "Guest Creators",
          }}
        />
        <Tabs.Screen name="video" options={{ href: null, headerShown: false, }} />
        <Tabs.Screen name="playlist" options={{ href: null, headerShown: false }} />
      </Tabs>
      </QueryClientProvider>
     </GestureHandlerRootView>
  );
}
