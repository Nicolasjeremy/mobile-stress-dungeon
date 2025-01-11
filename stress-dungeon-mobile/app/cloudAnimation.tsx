import React, { useRef, useEffect } from "react";
import { View, StyleSheet, Animated, Dimensions } from "react-native";

const { width } = Dimensions.get("window");

type CloudAnimationProps = {
  onAnimationComplete?: () => void;
};

export default function CloudAnimation({ onAnimationComplete }: CloudAnimationProps) {
  const cloudLeftX = useRef(new Animated.Value(-width)).current;
  const cloudRightX = useRef(new Animated.Value(width)).current;

  const startAnimation = () => {
    Animated.parallel([
      Animated.timing(cloudLeftX, {
        toValue: 0,
        duration: 2000,
        useNativeDriver: true,
      }),
      Animated.timing(cloudRightX, {
        toValue: 0,
        duration: 2000,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (onAnimationComplete) {
        onAnimationComplete();
      }
    });
  };

  useEffect(() => {
    startAnimation();
  }, []);

  return (
    <View style={styles.container}>
      {/* Left Cloud */}
      <Animated.Image
        source={require("../assets/images/cloud2.png")}
        style={[
          styles.cloud,
          {
            transform: [
              { translateX: cloudLeftX },
              { scale: 1.4 }, // Scale up by 40%
            ],
          },
        ]}
      />
      {/* Right Cloud */}
      <Animated.Image
        source={require("../assets/images/cloud1.png")}
        style={[
          styles.cloud,
          {
            transform: [
              { translateX: cloudRightX },
              { scale: 1.4 }, // Scale up by 40%
            ],
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: "row",
  },
  cloud: {
    width,
    height: "100%",
    position: "absolute",
  },
});
