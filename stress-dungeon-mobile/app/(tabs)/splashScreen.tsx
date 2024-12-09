import React from "react";
import { View, StyleSheet } from "react-native";
import { Image } from "expo-image"; // Use expo-image for better GIF support

const SplashScreen = () => {
  return (
    <View style={styles.container}>
      <Image
        source={require("../../assets/images/splashRunningBG.gif")} // Replace with your GIF path
        style={styles.gif}
      />
    </View>
  );
};

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

export default SplashScreen;
