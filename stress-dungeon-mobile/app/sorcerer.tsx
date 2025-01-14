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

// We'll do a manual requestAnimationFrame approach for a jump-with-gravity demo.

const { width } = Dimensions.get("window");
const CANVAS_HEIGHT = 220; // height for the SVG
const TIME_STEP = 0.1; // simulation timestep in seconds
const GRAVITY = 9.8; // gravitational acceleration (m/s^2)

// Position of the "floor" (where the object starts and lands).
// We’ll define it slightly above the bottom of the SVG so we can see the object.
const FLOOR_Y = CANVAS_HEIGHT - 40;

export default function JumpLabScreen() {
  const router = useRouter();

  // User inputs
  const [jumpForce, setJumpForce] = useState("50");
  const [mass, setMass] = useState("5");

  // Track simulation state
  const [isSimulating, setIsSimulating] = useState(false);

  // Refs for position & velocity in the vertical direction (y-axis)
  // We'll treat y=0 at the top, y increases downward.
  const positionRef = useRef(FLOOR_Y); // start at floor
  const velocityRef = useRef(0); // start with zero velocity
  const animationRef = useRef<number | null>(null);

  // Force a re-render for the object’s position in <Svg>
  const [renderKey, setRenderKey] = useState(0);

  // Start the simulation
  const handleSimulate = () => {
    const F = parseFloat(jumpForce);
    const m = parseFloat(mass);

    if ([F, m].some(Number.isNaN)) {
      Alert.alert(
        "Error",
        "Please enter valid numbers for jump force and mass."
      );
      return;
    }

    // Convert jump force to an initial velocity (negative = upward if y increases downward)
    const vInitial = -F / m;

    // If initial velocity is >= 0, we can't go up
    if (vInitial >= 0) {
      Alert.alert(
        "Not Enough Force",
        "Your jump force is not large enough to overcome gravity."
      );
      return;
    }

    // Reset position and velocity
    positionRef.current = FLOOR_Y;
    velocityRef.current = vInitial;

    setIsSimulating(true);

    // Cancel any old animation loop
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    // Start a new loop
    animationRef.current = requestAnimationFrame(() => animate());
  };

  // The “game loop” using requestAnimationFrame
  const animate = () => {
    // Add gravity to velocity (gravity is positive since down is increasing y)
    velocityRef.current += GRAVITY * TIME_STEP;

    // Update position
    positionRef.current += velocityRef.current * TIME_STEP;

    // Check if object has hit the floor
    if (positionRef.current >= FLOOR_Y) {
      // Snap to floor, stop simulation
      positionRef.current = FLOOR_Y;
      setIsSimulating(false);
      return;
    }

    // Otherwise, re-render and keep going
    setRenderKey((prev) => prev + 1);
    animationRef.current = requestAnimationFrame(() => animate());
  };

  // Stop the simulation
  const handleStop = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    setIsSimulating(false);
  };

  // Navigate back to some screen (e.g. boss screen or hero selection)
  const handleBack = () => {
    router.back();
  };

  return (
    <ImageBackground
      source={require("../assets/images/boss.png")} // your background image
      style={styles.background}
      resizeMode="cover"
    >
      <ScrollView style={styles.overlay} contentContainerStyle={styles.content}>
        <View style={styles.headerContainer}>
          <Text style={styles.title}>JUMP LAB</Text>
          <Text style={styles.subtitle}>Gravity-Based Motion</Text>
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
            />
          </View>

          <View style={styles.formRow}>
            <Text style={styles.label}>Mass (kg):</Text>
            <TextInput
              style={styles.input}
              value={mass}
              onChangeText={setMass}
              keyboardType="numeric"
            />
          </View>

          {!isSimulating ? (
            <TouchableOpacity onPress={handleSimulate} style={styles.simButton}>
              <Text style={styles.simButtonText}>SIMULATE</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={handleStop}
              style={[styles.simButton, { backgroundColor: "#555" }]}
            >
              <Text style={styles.simButtonText}>STOP</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Visualization Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Motion Visualization</Text>
          <View style={styles.canvasContainer}>
            <Svg width={width} height={CANVAS_HEIGHT} key={renderKey}>
              {/* "Object" as a rectangle that moves vertically */}
              <Rect
                x={width / 2 - 20} // center the object horizontally
                y={positionRef.current - 40} // top of the object
                width={40}
                height={40}
                fill="blue"
              />
              {/* Floor */}
              <Rect x={0} y={FLOOR_Y} width={width} height={2} fill="gray" />
            </Svg>
          </View>
        </View>

        {/* Back Button */}
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>Back to Hero Selection</Text>
        </TouchableOpacity>
      </ScrollView>
    </ImageBackground>
  );
}

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
    textShadowColor: "#000",
    textShadowRadius: 2,
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
