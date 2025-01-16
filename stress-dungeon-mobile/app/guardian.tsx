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
import Svg, { Circle } from "react-native-svg";
import Animated, {
  useSharedValue,
  useAnimatedProps,
  useDerivedValue,
  runOnJS,
} from "react-native-reanimated";
import { updateBossHealth } from "./updateBossHealth";

// Canvas dimension references
const { width } = Dimensions.get("window");
const CANVAS_HEIGHT = 220;
const RADIUS = 20;

// 1) Rename your collision function to avoid conflicts
function computeCollisionVelocities(
  m1: number,
  v1: number,
  m2: number,
  v2: number,
  type: "elastic" | "inelastic"
) {
  if (type === "elastic") {
    const v1Final = ((m1 - m2) * v1 + 2 * m2 * v2) / (m1 + m2);
    const v2Final = ((m2 - m1) * v2 + 2 * m1 * v1) / (m1 + m2);
    return [v1Final, v2Final];
  } else {
    const finalVelocity = (m1 * v1 + m2 * v2) / (m1 + m2);
    return [finalVelocity, finalVelocity];
  }
}

// Animated version of the <Circle> from react-native-svg
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function GuardianScreen() {
  const router = useRouter();

  // User Inputs
  const [mass1, setMass1] = useState("2");
  const [velocity1, setVelocity1] = useState("3");
  const [mass2, setMass2] = useState("4");
  const [velocity2, setVelocity2] = useState("-2");
  const [collisionType, setCollisionType] = useState<"elastic" | "inelastic">(
    "elastic"
  );

  // Momentum & Energy
  const [momentumBefore, setMomentumBefore] = useState(0);
  const [momentumAfter, setMomentumAfter] = useState(0);
  const [energyBefore, setEnergyBefore] = useState(0);
  const [energyAfter, setEnergyAfter] = useState(0);

  // Reanimated shared values
  const circle1X = useSharedValue(RADIUS + 50);
  const circle1V = useSharedValue(0);

  const circle2X = useSharedValue(width - RADIUS - 50);
  const circle2V = useSharedValue(0);

  const [isSimulating, setIsSimulating] = useState(false);
  const simulatingRef = useSharedValue(0); // 0 = not simulating, 1 = simulating

  // Animated props for each circle
  const circle1Props = useAnimatedProps(() => ({ cx: circle1X.value }));
  const circle2Props = useAnimatedProps(() => ({ cx: circle2X.value }));

  useDerivedValue(() => {
    if (simulatingRef.value === 0) return;

    const dt = 1 / 60;

    // Move circles
    circle1X.value += circle1V.value * dt;
    circle2X.value += circle2V.value * dt;

    // define the collision logic inline
    function collisionFn(
      m1: number,
      v1: number,
      m2: number,
      v2: number,
      type: "elastic" | "inelastic"
    ): [number, number] {
      "worklet"; // The function itself is a mini-worklet
      if (type === "elastic") {
        const v1Final = ((m1 - m2) * v1 + 2 * m2 * v2) / (m1 + m2);
        const v2Final = ((m2 - m1) * v2 + 2 * m1 * v1) / (m1 + m2);
        return [v1Final, v2Final];
      } else {
        const finalVelocity = (m1 * v1 + m2 * v2) / (m1 + m2);
        return [finalVelocity, finalVelocity];
      }
    }

    // collision check
    if (
      circle2X.value - circle1X.value <= RADIUS * 2 &&
      circle1V.value > 0 &&
      circle2V.value < 0
    ) {
      const m1 = parseFloat(mass1);
      const m2 = parseFloat(mass2);
      const [v1After, v2After] = collisionFn(
        m1,
        circle1V.value,
        m2,
        circle2V.value,
        collisionType
      );
      circle1V.value = v1After;
      circle2V.value = v2After;
    }

    // if off-screen, stop
    if (circle1X.value > width + RADIUS || circle2X.value < -RADIUS) {
      simulatingRef.value = 0;
      runOnJS(setIsSimulating)(false);
    }
  }, [mass1, mass2, collisionType]);

  const handleSimulate = () => {
    const m1 = parseFloat(mass1);
    const v1 = parseFloat(velocity1);
    const m2 = parseFloat(mass2);
    const v2 = parseFloat(velocity2);

    if ([m1, v1, m2, v2].some(Number.isNaN)) {
      Alert.alert("Error", "Please enter valid numbers for mass & velocity.");
      return;
    }

    // Reset circles
    circle1X.value = RADIUS + 50;
    circle2X.value = width - RADIUS - 50;
    circle1V.value = v1;
    circle2V.value = v2;

    // Momentum & energy before
    const pBefore = m1 * v1 + m2 * v2;
    const eBefore = 0.5 * m1 * v1 ** 2 + 0.5 * m2 * v2 ** 2;
    setMomentumBefore(pBefore);
    setEnergyBefore(eBefore);

    // Compute after-collision for display
    let v1After, v2After;
    if (collisionType === "elastic") {
      v1After = ((m1 - m2) * v1 + 2 * m2 * v2) / (m1 + m2);
      v2After = ((m2 - m1) * v2 + 2 * m1 * v1) / (m1 + m2);
    } else {
      const finalV = (m1 * v1 + m2 * v2) / (m1 + m2);
      v1After = finalV;
      v2After = finalV;
    }

    const pAfter = m1 * v1After + m2 * v2After;
    const eAfter = 0.5 * m1 * v1After ** 2 + 0.5 * m2 * v2After ** 2;
    setMomentumAfter(pAfter);
    setEnergyAfter(eAfter);

    // Start the simulation
    setIsSimulating(true);
    simulatingRef.value = 1;
  };

  const handleStopSimulation = () => {
    simulatingRef.value = 0;
    setIsSimulating(false);
  };

  const handleBack = () => {
    router.push("/bossScreen");
  };

  return (
    <ImageBackground
      source={require("../assets/images/boss.png")}
      style={styles.background}
      resizeMode="cover"
    >
      {/* Scrollable layout */}
      <ScrollView style={styles.overlay} contentContainerStyle={styles.content}>
        <View style={styles.headerContainer}>
          <Text style={styles.title}>GUARDIAN TRAINING</Text>
          <Text style={styles.subtitle}>Real-Time Collision</Text>
        </View>

        {/* Collision Controls */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Collision Settings</Text>

          <View style={styles.formRow}>
            <Text style={styles.label}>Mass 1 (kg):</Text>
            <TextInput
              style={styles.input}
              value={mass1}
              onChangeText={setMass1}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.formRow}>
            <Text style={styles.label}>Velocity 1 (m/s):</Text>
            <TextInput
              style={styles.input}
              value={velocity1}
              onChangeText={setVelocity1}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.formRow}>
            <Text style={styles.label}>Mass 2 (kg):</Text>
            <TextInput
              style={styles.input}
              value={mass2}
              onChangeText={setMass2}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.formRow}>
            <Text style={styles.label}>Velocity 2 (m/s):</Text>
            <TextInput
              style={styles.input}
              value={velocity2}
              onChangeText={setVelocity2}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.formRow}>
            <Text style={styles.label}>Collision Type:</Text>
            <View style={{ flexDirection: "row", marginTop: 6 }}>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  collisionType === "elastic" && styles.toggleSelected,
                ]}
                onPress={() => setCollisionType("elastic")}
              >
                <Text
                  style={[
                    styles.toggleText,
                    collisionType === "elastic" && styles.toggleTextSelected,
                  ]}
                >
                  Elastic
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  collisionType === "inelastic" && styles.toggleSelected,
                ]}
                onPress={() => setCollisionType("inelastic")}
              >
                <Text
                  style={[
                    styles.toggleText,
                    collisionType === "inelastic" && styles.toggleTextSelected,
                  ]}
                >
                  Inelastic
                </Text>
              </TouchableOpacity>
            </View>
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

        {/* Momentum / Energy Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Momentum & Energy</Text>
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Momentum Before:</Text>
            <Text style={styles.resultValue}>{momentumBefore.toFixed(2)}</Text>
          </View>
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Momentum After:</Text>
            <Text style={styles.resultValue}>{momentumAfter.toFixed(2)}</Text>
          </View>
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Energy Before:</Text>
            <Text style={styles.resultValue}>{energyBefore.toFixed(2)}</Text>
          </View>
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Energy After:</Text>
            <Text style={styles.resultValue}>{energyAfter.toFixed(2)}</Text>
          </View>
        </View>

        {/* Visualization Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Collision Visualization</Text>
          <View style={styles.canvasContainer}>
            <Svg width={width} height={CANVAS_HEIGHT}>
              {/* Blue circle with Reanimated props */}
              <AnimatedCircle
                animatedProps={circle1Props}
                cy={CANVAS_HEIGHT / 2}
                r={RADIUS}
                fill="blue"
              />

              {/* Red circle with Reanimated props */}
              <AnimatedCircle
                animatedProps={circle2Props}
                cy={CANVAS_HEIGHT / 2}
                r={RADIUS}
                fill="red"
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

// ========== STYLES ==========
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
  toggleButton: {
    marginRight: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 2,
    borderColor: "#773737",
    borderRadius: 8,
    backgroundColor: "#FFF5E1",
  },
  toggleSelected: {
    backgroundColor: "#DDA15E",
  },
  toggleText: {
    color: "#773737",
    fontWeight: "bold",
  },
  toggleTextSelected: {
    color: "#FFF",
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
