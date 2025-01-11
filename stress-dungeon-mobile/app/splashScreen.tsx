import React from "react";
import { View, StyleSheet } from "react-native";
import { Image } from "expo-image"; // For better GIF support

export default function SplashScreen() {
  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/images/splashRunningBG.gif")}
        style={styles.gif}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FDF0D5",
  },
  gif: {
    width: 500,
    height: 500,
  },
});
