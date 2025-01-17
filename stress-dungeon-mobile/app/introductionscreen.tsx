import React, { useState, useEffect} from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity , ActivityIndicator} from "react-native";
import { useRouter } from "expo-router";
import CloudAnimation from "./cloudAnimation";
import * as Font from "expo-font";

export default function IntroductionScreen() {
  
  const router = useRouter();
  
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  useEffect(() => {
    const loadFonts = async () => {
      try {
        await Font.loadAsync({
          LostSignal: require("../assets/fonts/LostSignalRegular.otf"),
          RetroGaming: require("../assets/fonts/RetroGaming.ttf"),
        });
        setFontsLoaded(true);
      } catch (error) {
        console.error("Error loading fonts", error);
      }
    };

    loadFonts();
  }, []);


  const handleStartAdventure = () => {
    setIsAnimating(true);
  };
  
  // Called when the cloud animation completes
  const handleAnimationComplete = () => {
    // Navigate to the boss screen
    router.replace("/bossScreen");
  };
  
  if (!fontsLoaded) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

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
        <Text style={[styles.title, { fontFamily: "RetroGaming" }]}>HOW TO PLAY</Text>
        <Text style={[styles.description, { fontFamily: "LostSignal" }]}>
          Perjalananmu dimulai dengan memilih salah satu dari empat role yang
          tersedia, masing-masing menawarkan cara unik untuk menghadapi boss.
          Setiap role memiliki tantangan atau persoalan yang harus diselesaikan
          sesuai dengan karakteristiknya. 
          
          Setiap kali kamu berhasil menyelesaikan persoalan tersebut, health boss akan berkurang. Teruslah
          menyelesaikan tantangan hingga health boss mencapai 0 untuk
          menaklukkan boss dan berhasil keluar dari Stress Dungeon. 
          
          Pilih strategimu dengan bijak dan kalahkan stres dengan cara yang seru!
        </Text>
      </View>

      {/* Start Adventure Button */}
      <TouchableOpacity style={styles.button} onPress={handleStartAdventure}>
        <Text style={[styles.buttonText, { fontFamily: "RetroGaming" }]}>START ADVENTURE!</Text>
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
    backgroundColor: "#FDF0D5",
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
    color: "white",
    textShadowColor: "#000",
    textShadowOffset: { width: 5, height: 3 },
    textShadowRadius: 5,
  },
  description: {
    fontSize: 16,
    color: "#3B2F2F",
    textAlign: "center",
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
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    textShadowColor: "#000",
    textShadowOffset: { width: 3, height: 2 },
    textShadowRadius: 1,
  },
});