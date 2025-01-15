import { router } from "expo-router";
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  ScrollView,
  Image,
  DimensionValue,
} from "react-native";

// Firestore + Auth
import { auth, db } from "../firebaseconfig";
import { doc, onSnapshot, setDoc } from "firebase/firestore";

const { height } = Dimensions.get("window");

// Example roles data
const ROLES = [
  {
    name: "Knight",
    description:
      "Knight adalah seorang ahli pedang terampil dengan serangan jarak dekat.",
    image: require("../assets/images/knight.png"),
    route: "/archer",
  },
  {
    name: "Guardian",
    description:
      "Guardian adalah ksatria setia dengan armor berat, mampu memblokir serangan.",
    image: require("../assets/images/tank.png"),
    route: "/guardian",
  },
  {
    name: "Archer",
    description:
      "Archer adalah pemanah ahli dengan serangan jarak jauh yang presisi.",
    image: require("../assets/images/archer.png"),
    route: "/knight",
  },
  {
    name: "Sorcerer",
    description:
      "Archer adalah pengendali sihir dengan serangan gravitasi dan control.",
    image: require("../assets/images/mage.png"),
    route: "/sorcerer",
  },
];

export default function BossScreen() {
  const [bossHealth, setBossHealth] = useState(100);

  // Persistent animated value using useRef
  const translateY = useRef(new Animated.Value(height)).current;

  // Animate the bottom sheet only once when the component mounts
  useEffect(() => {
    Animated.timing(translateY, {
      toValue: height / 2,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [translateY]);

  // Listen to boss health from Firestore
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const bossDocRef = doc(db, "boss", user.uid);

    const unsubscribe = onSnapshot(bossDocRef, async (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.BossHealth !== undefined) {
          setBossHealth(data.BossHealth);

          // Navigate to win screen only if health is exactly 0
          if (data.BossHealth === 0) {
            router.push("/win");
            return; // stop further code in this callback
          }
        }
      } else {
        // No doc => create one
        try {
          await setDoc(bossDocRef, { BossHealth: 100 });
          console.log("Created new boss doc for user:", user.uid);
          setBossHealth(100);
        } catch (error) {
          console.error("Error creating boss doc:", error);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Handler when a role is pressed
  const handleSelectRole = (role: any) => {
    router.push(role.route);
    console.log("Selected role:", role.name);
  };

  // Compute fill percentage for the health bar
  const clampedHealth = Math.max(0, bossHealth);
  const healthBarWidth = `${(clampedHealth / 100) * 100}%` as DimensionValue;

  return (
    <View style={styles.container}>
      {/* BOSS BACKGROUND */}
      <ImageBackground
        source={require("../assets/images/boss.png")}
        style={styles.background}
        resizeMode="cover"
      >
        {/* TOP OVERLAY WITH BOSS NAME + HEALTH BAR */}
        <View style={styles.topOverlay}>
          <Text style={styles.bossName}>ODDOGARON, THE TOXIC WYVERN</Text>
          <View style={styles.healthBarContainer}>
            <View style={[styles.healthBarFill, { width: healthBarWidth }]} />
            <Text style={styles.healthText}>{bossHealth} / 100</Text>
          </View>
        </View>
      </ImageBackground>

      {/* ROLE SELECTION PANEL (BOTTOM SHEET) */}
      <Animated.View
        style={[
          styles.bottomSheet,
          {
            transform: [{ translateY }],
            height: height / 2,
          },
        ]}
      >
        <Text style={styles.bottomSheetTitle}>SELECT YOUR ROLE!</Text>
        <ScrollView contentContainerStyle={styles.rolesContainer}>
          {ROLES.map((role, index) => (
            <TouchableOpacity
              key={index}
              style={styles.roleCard}
              onPress={() => handleSelectRole(role)}
              activeOpacity={0.8}
            >
              <Image source={role.image} style={styles.roleImage} />
              <View style={{ flex: 1 }}>
                <Text style={styles.roleName}>{role.name}</Text>
                <Text style={styles.roleDescription}>{role.description}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  background: {
    flex: 1,
    justifyContent: "flex-start",
  },
  topOverlay: {
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  bossName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ff4444",
    textAlign: "center",
    marginBottom: 10,
    textShadowColor: "#000",
    textShadowRadius: 4,
  },
  healthBarContainer: {
    width: "100%",
    backgroundColor: "#333",
    borderRadius: 10,
    overflow: "hidden",
    alignItems: "center",
    position: "relative",
  },
  healthBarFill: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "red",
  },
  healthText: {
    zIndex: 2,
    color: "#fff",
    fontWeight: "bold",
    margin: 5,
  },
  bottomSheet: {
    position: "absolute",
    left: 0,
    right: 0,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    backgroundColor: "#E4AB90",
    padding: 15,
    elevation: 10,
  },
  bottomSheetTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    textShadowColor: "#000",
    textShadowRadius: 4,
    textAlign: "center",
    marginBottom: 10,
  },
  rolesContainer: {
    paddingBottom: 20,
  },
  roleCard: {
    flexDirection: "row",
    backgroundColor: "#FFF5E1",
    borderRadius: 15,
    borderWidth: 2,
    borderColor: "#773737",
    marginVertical: 6,
    padding: 10,
    alignItems: "center",
  },
  roleImage: {
    width: 60,
    height: 60,
    marginRight: 10,
    resizeMode: "contain",
  },
  roleName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#773737",
  },
  roleDescription: {
    fontSize: 14,
    color: "#3B2F2F",
  },
});
