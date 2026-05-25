import { Link } from "expo-router";
import { Text, View, ImageBackground, StyleSheet } from "react-native";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import { Layout, Typography } from "@/styles";

const image = require("../../assets/images/sign-in.png");

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  image: {
    flex: 1,
    justifyContent: "center",
  },
  text: {
    color: "white",
    fontSize: 42,
    lineHeight: 84,
    fontWeight: "bold",
    textAlign: "center",

  },
});
export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <ImageBackground source={image} resizeMode="cover" style={styles.image}>
        <Text style={styles.text}>PowTV</Text>
      </ImageBackground>
    </View>
    // <View
    //   style={{
    //     flex: 1,
    //     justifyContent: "center",
    //     alignItems: "center",
    //   }}
    // >
    //   <Text>Welcome to PowTv!</Text>
    //   <Link href="/explore" push>
    //     {" "}
    //     Go to explore
    //   </Link>
    // </View>
  );
}
