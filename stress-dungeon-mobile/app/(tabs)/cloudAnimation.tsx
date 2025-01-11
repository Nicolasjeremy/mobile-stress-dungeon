import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Image, View, Dimensions } from "react-native";

// Get screen width and height
const { width, height } = Dimensions.get("window");

export default function CloudAnimation(){
  const cloud1X = useRef(new Animated.Value(width)).current;
  const cloud2X = useRef(new Animated.Value(width * 1.5)).current;

  // Function to animate clouds
  const animateClouds = () => {
    Animated.loop(
      Animated.parallel([
        Animated.timing(cloud1X, {
          toValue: -width,
          duration: 10000,
          useNativeDriver: true,
        }),
        Animated.timing(cloud2X, {
          toValue: 0,
          duration: 10000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  // Start the animation on mount
  useEffect(() => {
    animateClouds();
  }, []);

  return (
    <View style={styles.container}>
      {/* Cloud 1 */}
      <Animated.Image
        source={require("../../assets/images/cloud1.png")}
        style={[styles.cloud, { transform: [{ translateX: cloud1X }] }]}
        resizeMode="contain"
      />
      {/* Cloud 2 */}
      <Animated.Image
        source={require("../../assets/images/cloud2.png")}
        style={[styles.cloud, { transform: [{ translateX: cloud2X }] }]}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: "hidden",
    backgroundColor: "#87CEEB",
  },
  cloud: {
    position: "absolute",
    width: width * 1.5,
    height: 150,
    top: "30%", // Adjust as needed
  },
});
