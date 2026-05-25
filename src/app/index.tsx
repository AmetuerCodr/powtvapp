import { Link } from 'expo-router';
import { Text, View } from 'react-native';
import { Layout, Typography } from '@/styles';

export default function HomeScreen() {
  return (
    <View style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: "center"
    }}  >
      <Text >index</Text>

      <Link href="/explore" push> Go to explore</Link>
    </View>
  );
}
