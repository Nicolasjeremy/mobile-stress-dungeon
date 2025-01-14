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
  DimensionValue,
} from "react-native";
import { useRouter } from "expo-router";
import Svg, { Path, Line } from "react-native-svg";

// Firebase
import { auth, db } from "../firebaseconfig";
import { doc, onSnapshot, updateDoc, increment } from "firebase/firestore";

// Helper: generate random target within [min, max]
function generateRandomTarget(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Calculate projectile points
function calculateTrajectoryPoints(
  velocity: number,
  angleDeg: number,
  gravity: number
) {
  const points: Array<{ x: number; y: number }> = [];
  const angleRad = (angleDeg * Math.PI) / 180;
  const totalTime = (2 * velocity * Math.sin(angleRad)) / gravity;
  const steps = 50;

  for (let i = 0; i <= steps; i++) {
    const t = (totalTime / steps) * i;
    const x = velocity * Math.cos(angleRad) * t;
    const y = velocity * Math.sin(angleRad) * t - 0.5 * gravity * t * t;
    if (y >= 0) {
      points.push({ x, y });
    }
  }
  return points;
}

export default function KnightScreen() {
  const router = useRouter();

  // Boss health from Firestore
  const [bossHealth, setBossHealth] = useState(100);

  // Inputs
  const [velocity, setVelocity] = useState("20");
  const [angle, setAngle] = useState("45");
  const [gravity, setGravity] = useState("9.8");

  // Random target
  const [targetDistance, setTargetDistance] = useState(0);

  // Trajectory
  const [trajectoryPoints, setTrajectoryPoints] = useState<
    Array<{ x: number; y: number }>
  >([]);

  // 1) Listen for changes to BossHealth from Firestore
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      // not signed in? optionally navigate to login, or just skip
      return;
    }

    // Reference to this user’s boss doc
    const bossDocRef = doc(db, "boss", user.uid);

    // Subscribe to real-time changes
    const unsubscribe = onSnapshot(bossDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.BossHealth !== undefined) {
          setBossHealth(data.BossHealth);
        }
      } else {
        console.log("No boss doc found for this user.");
      }
    });

    return () => unsubscribe();
  }, []);

  // Generate random target at mount
  useEffect(() => {
    setTargetDistance(generateRandomTarget(20, 100));
  }, []);

  const handleSimulate = async () => {
    const velNum = parseFloat(velocity);
    const angleNum = parseFloat(angle);
    const gravityNum = parseFloat(gravity);

    if (isNaN(velNum) || isNaN(angleNum) || isNaN(gravityNum)) {
      Alert.alert(
        "Error",
        "Please enter valid numbers for velocity, angle, and gravity."
      );
      return;
    }

    // Calculate trajectory
    const points = calculateTrajectoryPoints(velNum, angleNum, gravityNum);
    setTrajectoryPoints(points);

    // Max distance of projectile
    const angleRad = (angleNum * Math.PI) / 180;
    const totalTime = (2 * velNum * Math.sin(angleRad)) / gravityNum;
    const maxDistance = velNum * Math.cos(angleRad) * totalTime;

    // Check if user hits target
    const difference = Math.abs(maxDistance - targetDistance);
    if (difference <= 5) {
      // 2) Decrement boss health in Firestore
      try {
        const user = auth.currentUser;
        if (user) {
          const bossDocRef = doc(db, "boss", user.uid);

          // Subtract 25
          await updateDoc(bossDocRef, {
            BossHealth: increment(-25),
          });
        }
      } catch (error) {
        console.log("Error decrementing boss health:", error);
      }

      // We *also* see local state changes because of the Firestore onSnapshot
      if (bossHealth - 25 <= 0) {
        Alert.alert("Boss Defeated!", "You have vanquished the boss!");
      } else {
        Alert.alert(
          "Hit!",
          `Great shot! Boss health is now ${bossHealth - 25}.`
        );
      }
    } else {
      Alert.alert(
        "Miss!",
        `You missed by ${difference.toFixed(2)} meters. Keep trying!`
      );
    }
  };

  const handleBack = () => {
    router.back();
  };

  // For SVG chart
  const { width } = Dimensions.get("window");
  const chartHeight = 220;

  let maxX = 1;
  let maxY = 1;
  trajectoryPoints.forEach((p) => {
    if (p.x > maxX) maxX = p.x;
    if (p.y > maxY) maxY = p.y;
  });

  // Build the path
  let pathData = "";
  trajectoryPoints.forEach((p, i) => {
    const padding = 20;
    const scaledX = padding + (p.x / maxX) * (width - 2 * padding);
    const scaledY =
      chartHeight - padding - (p.y / maxY) * (chartHeight - 2 * padding);
    if (i === 0) {
      pathData = `M ${scaledX},${scaledY}`;
    } else {
      pathData += ` L ${scaledX},${scaledY}`;
    }
  });

  // For the health bar, compute width as a percentage
  const healthPercentage = Math.max(0, bossHealth); // clamp at 0
  const healthBarWidth = `${(healthPercentage / 100) * 100}%` as DimensionValue; // e.g. "75%"

  return (
    <ImageBackground
      source={require("../assets/images/boss.png")}
      style={styles.background}
      resizeMode="cover"
    >
      {/* Scrollable content */}
      <ScrollView style={styles.overlay} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <Text style={styles.title}>KNIGHT TRAINING</Text>

          {/* Health bar that matches Firestore value */}
          <View style={styles.healthBarContainer}>
            <View style={[styles.healthBarFill, { width: healthBarWidth }]} />
            <Text style={styles.healthText}>{bossHealth} / 100</Text>
          </View>
        </View>

        {/* Controls Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Projectile Controls</Text>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Velocity (m/s):</Text>
            <TextInput
              style={styles.input}
              value={velocity}
              onChangeText={setVelocity}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Angle (°):</Text>
            <TextInput
              style={styles.input}
              value={angle}
              onChangeText={setAngle}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Gravity (m/s²):</Text>
            <TextInput
              style={styles.input}
              value={gravity}
              onChangeText={setGravity}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Target Distance (±5m):</Text>
            <Text style={styles.valueText}>{targetDistance} m</Text>
          </View>

          <TouchableOpacity onPress={handleSimulate} style={styles.simButton}>
            <Text style={styles.simButtonText}>SIMULATE</Text>
          </TouchableOpacity>
        </View>

        {/* Chart Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Trajectory Visualization</Text>
          <View style={styles.chartContainer}>
            <Svg width={width} height={chartHeight}>
              {/* Baseline (ground) */}
              <Line
                x1="20"
                y1={chartHeight - 20}
                x2={width - 20}
                y2={chartHeight - 20}
                stroke="gray"
                strokeWidth={2}
              />
              {/* Projectile path */}
              {pathData && (
                <Path d={pathData} fill="none" stroke="blue" strokeWidth={3} />
              )}
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

const styles = StyleSheet.create({
  /** Background image fills the screen. */
  background: {
    flex: 1,
  },
  /** A semi-transparent overlay to darken the background slightly. */
  overlay: {
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  /** Content container for the ScrollView. */
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  /** Header area with title + boss health bar. */
  headerContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    marginTop: 40,
    fontSize: 26,
    color: "#FFD700",
    fontWeight: "bold",
    textShadowColor: "#000",
    textShadowRadius: 5,
    marginBottom: 10,
  },
  /**
   * Health bar container & fill
   * (like your bossScreen example).
   */
  healthBarContainer: {
    width: "100%",
    backgroundColor: "#333",
    borderRadius: 10,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
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
  /** Common card style for controls and chart. */
  card: {
    backgroundColor: "#FFF5E1",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#773737",
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#773737",
    textAlign: "center",
    marginBottom: 10,
    textShadowColor: "#000",
    textShadowRadius: 2,
  },
  formGroup: {
    marginTop: 10,
  },
  label: {
    color: "#773737",
    fontWeight: "bold",
  },
  input: {
    backgroundColor: "#FFFFFF",
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#CCC",
    marginTop: 4,
  },
  valueText: {
    marginTop: 6,
    fontWeight: "bold",
    color: "#333",
  },
  simButton: {
    backgroundColor: "#DDA15E",
    padding: 15,
    borderRadius: 20,
    borderWidth: 4,
    borderColor: "#773737",
    marginTop: 16,
    alignItems: "center",
  },
  simButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    textShadowColor: "black",
    textShadowRadius: 9,
  },
  /** Chart container for the SVG. */
  chartContainer: {
    marginTop: 10,
    backgroundColor: "#FFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#CCC",
    overflow: "hidden",
  },
  /** The “Back to Boss Screen” button at the bottom. */
  backButton: {
    alignSelf: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: "#8B0000",
    borderRadius: 10,
  },
  backButtonText: {
    color: "#fff",
    fontSize: 16,
  },
});
