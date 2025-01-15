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

// Firestore + Auth imports
import { doc, updateDoc, increment } from "firebase/firestore";
import { auth, db } from "../firebaseconfig";

const { width } = Dimensions.get("window");
const CANVAS_HEIGHT = 220;
const TIME_STEP = 0.1; // simulation timestep in seconds

export default function ArcherScreen() {
  const router = useRouter();

  // User inputs
  const [force, setForce] = useState("50");
  const [mass, setMass] = useState("5");
  const [frictionCoeff, setFrictionCoeff] = useState("0.2");

  // Track whether we’re simulating
  const [isSimulating, setIsSimulating] = useState(false);

  // Refs for position & velocity
  const positionRef = useRef(0);
  const velocityRef = useRef(0);
  const animationRef = useRef<number | null>(null);

  // Force a re-render for the arrow’s position in <Svg>
  const [renderKey, setRenderKey] = useState(0);

  // Start the simulation
  const handleSimulate = () => {
    const F = parseFloat(force);
    const m = parseFloat(mass);
    const mu = parseFloat(frictionCoeff);

    if ([F, m, mu].some(Number.isNaN)) {
      Alert.alert(
        "Error",
        "Please enter valid numbers for force, mass, and friction."
      );
      return;
    }

    // friction force
    const frictionForce = mu * m * 9.8;
    const netForce = F - frictionForce;

    if (netForce <= 0) {
      Alert.alert(
        "Insufficient Force",
        "Push force is too small to overcome friction!"
      );
      return;
    }

    // acceleration
    const a = netForce / m;

    // reset position & velocity
    positionRef.current = 0;
    velocityRef.current = 0;

    setIsSimulating(true);

    // start the animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    animationRef.current = requestAnimationFrame(() => animate(a));
  };

  // The “game loop” using requestAnimationFrame
  const animate = (acceleration: number) => {
    // Update velocity & position
    velocityRef.current += acceleration * TIME_STEP;
    positionRef.current += velocityRef.current * TIME_STEP;

    // If arrow goes off screen, stop and decrement boss health
    if (positionRef.current > width) {
      setIsSimulating(false);

      const user = auth.currentUser;
      if (user) {
        const bossDocRef = doc(db, "boss", user.uid);

        // Subtract 20 from BossHealth
        updateDoc(bossDocRef, {
          BossHealth: increment(-20),
        })
          .then(() => {
            console.log("Boss health decremented by 20");
          })
          .catch((error) => {
            console.error("Error decrementing boss health:", error);
          });
      }
      return;
    }

    // Otherwise, re-draw
    setRenderKey((prev) => prev + 1);

    // schedule next frame
    animationRef.current = requestAnimationFrame(() => animate(acceleration));
  };

  // Stop the simulation
  const handleStop = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    setIsSimulating(false);
  };

  // Navigate back
  const handleBack = () => {
    router.back();
  };

  return (
    <ImageBackground
      source={require("../assets/images/boss.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <ScrollView style={styles.overlay} contentContainerStyle={styles.content}>
        <View style={styles.headerContainer}>
          <Text style={styles.title}>ARCHER TRAINING</Text>
          <Text style={styles.subtitle}>Friction-Based Motion</Text>
        </View>

        {/* Input Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Motion Settings</Text>

          <View style={styles.formRow}>
          <Text style={styles.label}>berikanlah dorongan untuk mendorong kotak biru sampai ke baagian kanan untuk menyerang boss</Text>
            <Text style={styles.label}>Force (N):</Text>
            <TextInput
              style={styles.input}
              value={force}
              onChangeText={setForce}
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

          <View style={styles.formRow}>
            <Text style={styles.label}>Friction Coeff:</Text>
            <TextInput
              style={styles.input}
              value={frictionCoeff}
              onChangeText={setFrictionCoeff}
              keyboardType="numeric"
            />
          </View>

          {/* Sim/Stop Buttons */}
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
              {/* "Arrow" as a rectangle that moves horizontally */}
              <Rect
                x={positionRef.current}
                y={CANVAS_HEIGHT / 2 - 20}
                width={50}
                height={40}
                fill="blue"
              />
              {/* Ground plane */}
              <Rect
                x={0}
                y={CANVAS_HEIGHT / 2 + 20}
                width={width}
                height={10}
                fill="gray"
              />
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
