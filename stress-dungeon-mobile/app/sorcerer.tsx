// app/sorcererJumpScreen.tsx
import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Alert,
  Dimensions,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import Svg, { Rect } from "react-native-svg";

import { doc, updateDoc, increment } from "firebase/firestore";
import { auth, db } from "../firebaseconfig";

// Canvas and physics constants
const { width } = Dimensions.get("window");
const CANVAS_HEIGHT = 220;
const TIME_STEP = 0.1; // Time step for simulation
const GRAVITY = 9.8; // Gravity constant
const FLOOR_Y = CANVAS_HEIGHT - 40; // Position of the floor on the canvas

export default function SorcererJumpScreen() {
  const router = useRouter();

  // User inputs for jump simulation
  const [jumpForce, setJumpForce] = useState("50");
  const [mass, setMass] = useState("5");

  // State and refs to track simulation
  const [isSimulating, setIsSimulating] = useState(false);
  const positionRef = useRef(FLOOR_Y); // Position of the jumping object
  const velocityRef = useRef(0); // Velocity of the object
  const animationRef = useRef<number | null>(null); // Reference for the animation frame
  const [renderKey, setRenderKey] = useState(0); // Re-render key for the rectangle

  // Handle simulation start
  const handleSimulate = () => {
    const force = parseFloat(jumpForce);
    const massValue = parseFloat(mass);

    if ([force, massValue].some(Number.isNaN)) {
      Alert.alert("Invalid Input", "Please enter valid numbers.");
      return;
    }

    // Initial velocity calculation
    const initialVelocity = -force / massValue;
    if (initialVelocity >= 0) {
      Alert.alert("Error", "The jump force is not sufficient to lift the object.");
      return;
    }

    // Reset position and velocity
    positionRef.current = FLOOR_Y;
    velocityRef.current = initialVelocity;
    setIsSimulating(true);

    // Start the animation loop
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    animationRef.current = requestAnimationFrame(animate);
  };

  // Main animation loop
  const animate = () => {
    velocityRef.current += GRAVITY * TIME_STEP;
    positionRef.current += velocityRef.current * TIME_STEP;

    // Handle floor collision
    if (positionRef.current >= FLOOR_Y) {
      positionRef.current = FLOOR_Y;
      setIsSimulating(false);

      // Check if jump height exceeds the threshold
      const maxHeight = Math.pow(-velocityRef.current, 2) / (2 * GRAVITY);
      if (maxHeight >= 10) {
        // Update boss health if jump is successful
        const user = auth.currentUser;
        if (user) {
          const bossDocRef = doc(db, "boss", user.uid);
          updateDoc(bossDocRef, {
            BossHealth: increment(-25),
          })
            .then(() => {
              Alert.alert("Success!", "You jumped more than 10 meters! Boss health -25.");
            })
            .catch((err) => {
              console.error("Error updating boss health:", err);
            });
        }
      }

      return;
    }

    // Re-render the canvas
    setRenderKey((prev) => prev + 1);
    animationRef.current = requestAnimationFrame(animate);
  };

  // Stop the simulation
  const handleStop = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    setIsSimulating(false);
  };

  // Handle navigation back to the Boss Screen
  const handleBack = () => {
    router.replace("/bossScreen");
  };

  return (
    <ImageBackground
      source={require("../assets/images/boss.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <ScrollView style={styles.overlay} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <Text style={styles.title}>SORCERER JUMP LAB</Text>
          <Text style={styles.subtitle}>Gravity-Based Motion Simulation</Text>
        </View>

        {/* Input Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Jump Settings</Text>

          <View style={styles.formRow}>
            <Text style={styles.label}>Jump Force (N):</Text>
            <TextInput
              style={styles.input}
              value={jumpForce}
              onChangeText={setJumpForce}
              keyboardType="numeric"
              editable={!isSimulating}
            />
          </View>

          <View style={styles.formRow}>
            <Text style={styles.label}>Mass (kg):</Text>
            <TextInput
              style={styles.input}
              value={mass}
              onChangeText={setMass}
              keyboardType="numeric"
              editable={!isSimulating}
            />
          </View>

          {!isSimulating ? (
            <TouchableOpacity onPress={handleSimulate} style={styles.simButton}>
              <Text style={styles.simButtonText}>SIMULATE</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={handleStop} style={[styles.simButton, { backgroundColor: "#555" }]}>
              <Text style={styles.simButtonText}>STOP</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Visualization Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Motion Visualization</Text>
          <View style={styles.canvasContainer}>
            <Svg width={width} height={CANVAS_HEIGHT} key={renderKey}>
              <Rect x={width / 2 - 20} y={positionRef.current - 40} width={40} height={40} fill="blue" />
              <Rect x={0} y={FLOOR_Y} width={width} height={2} fill="gray" />
            </Svg>
          </View>
        </View>

        {/* Back Button */}
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>Back to Boss Screen</Text>
        </TouchableOpacity>
      </ScrollView>
    </ImageBackground>
  );
}

// Styles
const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  overlay: {
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  content: {
    padding: 16,
    paddingBottom: 50,
  },
  headerContainer: {
    alignItems: "center",
    marginTop: 40,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    color: "#FFD700",
    fontWeight: "bold",
    textShadowColor: "#000",
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "#FFF",
    marginTop: 6,
  },
  card: {
    backgroundColor: "#FFF5E1",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#773737",
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 18,
    color: "#773737",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  formRow: {
    marginTop: 10,
  },
  label: {
    color: "#773737",
    fontWeight: "bold",
    marginBottom: 4,
  },
  input: {
    backgroundColor: "#FFFFFF",
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#CCC",
    marginBottom: 6,
  },
  simButton: {
    marginTop: 16,
    backgroundColor: "#DDA15E",
    padding: 15,
    borderRadius: 20,
    borderWidth: 4,
    borderColor: "#773737",
    alignItems: "center",
  },
  simButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    textShadowColor: "#000",
    textShadowRadius: 6,
  },
  canvasContainer: {
    marginTop: 10,
    backgroundColor: "#FFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#CCC",
    overflow: "hidden",
    alignItems: "center",
  },
  backButton: {
    alignSelf: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#8B0000",
    borderRadius: 10,
  },
  backButtonText: {
    color: "#fff",
    fontSize: 16,
  },
});
