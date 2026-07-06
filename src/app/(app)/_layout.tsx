import { Tabs } from "expo-router";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
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


export default function AppTabs() {
  return (
    <QueryClientProvider client={queryClient}>
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#FFFFFF",
        tabBarInactiveTintColor: "#6B7280",
        tabBarStyle: {
          backgroundColor: "#18181B",
          borderTopWidth: 0,
        },
        // headerStyle: { backgroundColor: "#18181B" },
        headerShown: false,
        headerTintColor: "#FFFFFF",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          sceneStyle: {
            backgroundColor: "#000",
          },
          // tabBarStyle: { display: "none" },
          tabBarIcon: ({ color, size }) => (
            <Home width={size} height={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "Search",
          tabBarIcon: ({ color, size }) => (
            <Search width={size} height={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="watch"
        options={{
          title: "Watch",
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
          sceneStyle: {
            backgroundColor: "#000",
          },
          tabBarIcon: ({ size }) => <Profile width={size} height={size} />,
        }}
      />
      
        <Tabs.Screen name="explore" options={{ href: null }} />
        <Tabs.Screen name="video" options={{ href: null, headerShown: false }} />
      </Tabs>
    </QueryClientProvider>
  );
}
