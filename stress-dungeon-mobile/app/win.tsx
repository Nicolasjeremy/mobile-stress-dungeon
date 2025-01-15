import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { auth, db } from "../firebaseconfig";
import { doc, updateDoc } from "firebase/firestore";

// Function to reset the boss health to 100 in Firestore
async function resetBossHealthTo100() {
  try {
    const user = auth.currentUser;
    if (user) {
      const bossDocRef = doc(db, "boss", user.uid);
      await updateDoc(bossDocRef, { BossHealth: 100 });
      console.log("Boss health reset to 100!");
    } else {
      console.log("No user is logged in!");
    }
  } catch (error) {
    console.error("Error resetting boss health:", error);
  }
}

export default function WinScreen() {
  const router = useRouter();

  const handleStartAdventure = async () => {
    try {
      // 1. Reset the boss health
      await resetBossHealthTo100();

      // 2. Navigate back to Boss Screen
      router.replace("/bossScreen");
    } catch (error) {
      console.error("Failed to reset boss health:", error);
    }
  };

  return (
    <ImageBackground
      source={require("../assets/images/win.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>YOU SURVIVED!</Text>
          <Text style={styles.description}>
            You have conquered the Stress Dungeon! The boss has been defeated, and you're ready for the next challenge.
          </Text>

          <TouchableOpacity
            style={styles.button}
            onPress={handleStartAdventure}
          >
            <Text style={styles.buttonText}>Go Back to Dungeon!</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    padding: 16,
    justifyContent: "center",
    alignItems: "center",
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
    marginTop: 100,
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
    marginBottom: 20,
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
    alignSelf: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    textShadowColor: "#000",
    textShadowRadius: 4,
  },
});
