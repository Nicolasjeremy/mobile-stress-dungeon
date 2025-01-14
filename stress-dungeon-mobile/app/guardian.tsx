import React, { useState, useEffect } from "react";
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
import Svg, { Circle, Rect } from "react-native-svg";
import Animated, {
  useSharedValue,
  useAnimatedProps,
  useDerivedValue,
  runOnJS,
} from "react-native-reanimated";

// Canvas dimension references
const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get("window");
const CANVAS_HEIGHT = 300;
const GROUND_HEIGHT = 50;
const OBJECT_RADIUS = 20;

// Animated version of the <Circle> from react-native-svg
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function SorcererGravityScreen() {
  const router = useRouter();

  // User Inputs
  const [mass, setMass] = useState("1");
  const [initialHeight, setInitialHeight] = useState("10");
  const [initialVelocity, setInitialVelocity] = useState("0");

  // Reanimated shared values
  const objectY = useSharedValue(0);
  const objectVelocity = useSharedValue(0);
  const simulatingRef = useSharedValue(0); // 0 = not simulating, 1 = simulating
  const elapsedTime = useSharedValue(0);

  const [isSimulating, setIsSimulating] = useState(false);

  // Animated props for the object
  const objectProps = useAnimatedProps(() => ({
    cy: CANVAS_HEIGHT - GROUND_HEIGHT - objectY.value,
  }));

  // Physics constants
  const GRAVITY = 9.8;

  // Derived value for simulation logic
  useDerivedValue(() => {
    if (simulatingRef.value === 0) return;

    const dt = 1 / 60;
    elapsedTime.value += dt;

    // Gravity in px/s^2
    const gravityInPixels = 9.8 * METER_TO_PX;

    // Update velocity (downward => velocity grows negative if you treat y=0 at bottom)
    // Or invert signs if your coordinate system is reversed
    objectVelocity.value -= gravityInPixels * dt;

    // Update position
    objectY.value += objectVelocity.value * dt;

    // Ground collision check
    if (objectY.value <= 0) {
      objectY.value = 0;
      objectVelocity.value = 0;
      simulatingRef.value = 0;
      runOnJS(setIsSimulating)(false);
    }
  });

  const METER_TO_PX = 20; // or whatever scale you like

  const handleSimulate = () => {
    const parsedMass = parseFloat(mass);
    const parsedHeight = parseFloat(initialHeight);
    const parsedVelocity = parseFloat(initialVelocity);

    // Validate inputs
    if ([parsedMass, parsedHeight, parsedVelocity].some(Number.isNaN)) {
      Alert.alert("Error", "Please enter valid numbers...");
      return;
    }

    // Reset shared values using the chosen scale
    objectY.value = parsedHeight * METER_TO_PX;
    objectVelocity.value = parsedVelocity * METER_TO_PX;
    elapsedTime.value = 0;

    // Make sure simulatingRef is reset
    simulatingRef.value = 0;

    // Now start
    setIsSimulating(true);
    simulatingRef.value = 1;
  };

  const handleStopSimulation = () => {
    simulatingRef.value = 0;
    setIsSimulating(false);
  };

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
          <Text style={styles.title}>SORCERER'S GRAVITY LAB</Text>
          <Text style={styles.subtitle}>Falling Object Simulation</Text>
        </View>

        {/* Object Properties */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Object Settings</Text>

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

          <View style={styles.formRow}>
            <Text style={styles.label}>Initial Height (m):</Text>
            <TextInput
              style={styles.input}
              value={initialHeight}
              onChangeText={setInitialHeight}
              keyboardType="numeric"
              editable={!isSimulating}
            />
          </View>

          <View style={styles.formRow}>
            <Text style={styles.label}>Initial Velocity (m/s):</Text>
            <TextInput
              style={styles.input}
              value={initialVelocity}
              onChangeText={setInitialVelocity}
              keyboardType="numeric"
              editable={!isSimulating}
            />
          </View>

          {/* Simulate or Stop */}
          {!isSimulating ? (
            <TouchableOpacity onPress={handleSimulate} style={styles.simButton}>
              <Text style={styles.simButtonText}>SIMULATE</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={handleStopSimulation}
              style={[styles.simButton, { backgroundColor: "#555" }]}
            >
              <Text style={styles.simButtonText}>STOP</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Simulation Statistics */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Simulation Stats</Text>
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Current Height:</Text>
            <Text style={styles.resultValue}>
              {isSimulating
                ? (CANVAS_HEIGHT - GROUND_HEIGHT - objectY.value).toFixed(2)
                : initialHeight}{" "}
              m
            </Text>
          </View>
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Velocity:</Text>
            <Text style={styles.resultValue}>
              {objectVelocity.value.toFixed(2)} m/s
            </Text>
          </View>
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Time:</Text>
            <Text style={styles.resultValue}>
              {elapsedTime.value.toFixed(2)} s
            </Text>
          </View>
        </View>

        {/* Visualization */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Falling Object</Text>
          <View style={styles.canvasContainer}>
            <Svg width="100%" height={CANVAS_HEIGHT}>
              {/* Ground */}
              <Rect
                x="0"
                y={CANVAS_HEIGHT - GROUND_HEIGHT}
                width="100%"
                height={GROUND_HEIGHT}
                fill="#8B4513"
              />

              {/* Falling Object */}
              <AnimatedCircle
                animatedProps={objectProps}
                cx="50%"
                r={OBJECT_RADIUS}
                fill="#FF6347"
              />
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

// Styles (same as previous screens)
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
  resultRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },
  resultLabel: {
    fontWeight: "bold",
    color: "#773737",
  },
  resultValue: {
    color: "#333",
    fontWeight: "bold",
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
