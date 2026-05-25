import { Link, useRouter } from 'expo-router';
import { Text, View, Button } from 'react-native';
import { Layout, Typography } from '@/styles';



export default function ExploreScreen() {
  const router = useRouter()
  return (
    <View>
      <Text >explore</Text>
      <Link href="/" push>Go to index</Link>
    </View>
  );
}
