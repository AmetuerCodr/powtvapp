import { Link, useRouter } from 'expo-router';
import { Text, View, Button } from 'react-native';
import { Layout, Typography } from '@/styles';
import { SafeAreaView } from 'react-native-safe-area-context';



export default function ExploreScreen() {
  const router = useRouter()
  return (
  <SafeAreaView className='flex-1'>
    <View>
      <Text >explore</Text>
      <Link href="/" push>Go to index</Link>
      </View>
  </SafeAreaView>
  );
}
