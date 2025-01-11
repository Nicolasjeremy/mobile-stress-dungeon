// app/introduction.tsx
import React, { useState } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import CloudAnimation from "./cloudAnimation";

export default function IntroductionScreen() {
  const router = useRouter();

  // State to track whether the closing cloud animation is playing
  const [isAnimating, setIsAnimating] = useState(false);

  // Called when "Start Adventure!" is pressed
  const handleStartAdventure = () => {
    setIsAnimating(true); // Trigger the cloud animation
  };

  // Called when the cloud animation completes
  const handleAnimationComplete = () => {
    // Navigate to the boss screen
    router.push("/bossScreen");
  };

  // If isAnimating is true, we show the cloud animation instead of the intro content
  if (isAnimating) {
    return (
      <View style={styles.container}>
        {/* The same background, so it looks like the same screen behind the clouds */}
        <Image
          source={require("../assets/images/loadingPage.png")}
          style={styles.backgroundImage}
          resizeMode="cover"
        />
        {/* Cloud animation overlay */}
        <CloudAnimation onAnimationComplete={handleAnimationComplete} />
      </View>
    );
  }

  // Otherwise, show the "How to Play" card and the "Start Adventure" button
  return (
    <View style={styles.container}>
      {/* Background Image */}
      <Image
        source={require("../assets/images/loadingPage.png")}
        style={styles.backgroundImage}
        resizeMode="cover"
      />

      {/* How to Play Card */}
      <View style={styles.card}>
        <Text style={styles.title}>HOW TO PLAY</Text>
        <Text style={styles.description}>
          Perjalananmu dimulai ...
        </Text>
      </View>

      {/* Start Adventure Button */}
      <TouchableOpacity style={styles.button} onPress={handleStartAdventure}>
        <Text style={styles.buttonText}>START ADVENTURE!</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  backgroundImage: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  card: {
    width: "85%",
    backgroundColor: "#F4E1C8",
    padding: 20,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: "#773737",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
    color: "#773737",
    textShadowColor: "#000",
    textShadowRadius: 5,
  },
  description: {
    fontSize: 16,
    color: "#3B2F2F",
    textAlign: "justify",
    lineHeight: 22,
  },
  button: {
    marginTop: 20,
    backgroundColor: "#DDA15E",
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 20,
    borderWidth: 4,
    borderColor: "#773737",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    textShadowColor: "#000",
    textShadowRadius: 4,
  },
});
