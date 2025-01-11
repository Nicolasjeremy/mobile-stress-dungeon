// app/knightScreen.tsx
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
} from "react-native";
import { useRouter } from "expo-router";
import Svg, { Path, Line } from "react-native-svg";
import { useBossHealth } from "./BossHealthContext";

/** Helper to generate a random distance within [min, max]. */
function generateRandomTarget(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// We'll draw the trajectory in a 2D plane. We'll assume top-left is (0,0).
// We'll collect (x, y) points, then scale them to fit an area in the UI.
function calculateTrajectoryPoints(
  velocity: number,
  angleDeg: number,
  gravity: number
) {
  const points: Array<{ x: number; y: number }> = [];
  const angleRad = (angleDeg * Math.PI) / 180;

  // total flight time
  const totalTime = (2 * velocity * Math.sin(angleRad)) / gravity;
  // We'll sample the path at N steps
  const steps = 50;
  for (let i = 0; i <= steps; i++) {
    const t = (totalTime / steps) * i;
    const x = velocity * Math.cos(angleRad) * t;
    const y = velocity * Math.sin(angleRad) * t - 0.5 * gravity * t * t;
    if (y >= 0) {
      // Only push points while projectile is above ground
      points.push({ x, y });
    }
  }
  return points;
}

export default function KnightScreen() {
  const router = useRouter();

  // 1) Read & update global boss health from context
  const { bossHealth, setBossHealth } = useBossHealth();

  // Projectile inputs
  const [velocity, setVelocity] = useState("20");
  const [angle, setAngle] = useState("45");
  const [gravity, setGravity] = useState("9.8");

  // Random target distance
  const [targetDistance, setTargetDistance] = useState(0);

  // For trajectory visualization
  const [trajectoryPoints, setTrajectoryPoints] = useState<
    Array<{ x: number; y: number }>
  >([]);

  useEffect(() => {
    // On mount, generate a random target
    setTargetDistance(generateRandomTarget(20, 100));
  }, []);

  /** Called when user hits "Simulate" */
  const handleSimulate = () => {
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

    // Calculate the projectile path for visualization
    const points = calculateTrajectoryPoints(velNum, angleNum, gravityNum);
    setTrajectoryPoints(points);

    // Basic projectile formula to get total distance
    const angleRad = (angleNum * Math.PI) / 180;
    const totalTime = (2 * velNum * Math.sin(angleRad)) / gravityNum;
    const maxDistance = velNum * Math.cos(angleRad) * totalTime;

    // Check if user hits within ±5m of target
    const difference = Math.abs(maxDistance - targetDistance);
    if (difference <= 5) {
      // Decrease boss health by 25
      const newHealth = bossHealth - 25;
      setBossHealth(newHealth < 0 ? 0 : newHealth);

      if (newHealth <= 0) {
        Alert.alert("Boss Defeated!", "You have vanquished the boss!");
        // Optionally navigate:
        // router.push("/victory");
      } else {
        Alert.alert(
          "Hit!",
          `Great shot! Boss health is now ${newHealth <= 0 ? 0 : newHealth}.`
        );
      }
    } else {
      Alert.alert(
        "Miss!",
        `You missed by ${difference.toFixed(2)} meters. Keep trying!`
      );
    }
  };

  /** Back to boss screen (or whichever route you want) */
  const handleBack = () => {
    router.push("/bossScreen");
  };

  // We’ll render the trajectory in a simple <Svg> sized to the container
  // We'll scale x-distances to the width, y-distances to some fraction of the height
  const { width } = Dimensions.get("window");
  const height = 200; // some fixed height for the "chart" area

  // Find the max X distance in the trajectory. We'll scale X to fit the width
  // Same for Y, but we invert so that "up" is smaller y in SVG
  let maxX = 1;
  let maxY = 1;
  trajectoryPoints.forEach((p) => {
    if (p.x > maxX) maxX = p.x;
    if (p.y > maxY) maxY = p.y;
  });

  // Build an SVG path string
  // We'll start from bottom-left corner (0, height) and draw upwards
  let pathData = "";
  trajectoryPoints.forEach((p, i) => {
    // scale to fit
    const scaledX = (p.x / maxX) * (width * 0.9); // 0.9 so we have some margin
    const scaledY = height - (p.y / maxY) * (height * 0.9);

    if (i === 0) {
      pathData = `M ${scaledX},${scaledY}`;
    } else {
      pathData += ` L ${scaledX},${scaledY}`;
    }
  });

  return (
    <ImageBackground
      source={require("../assets/images/boss.png")} // same boss background
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        {/* Header: boss name + health */}
        <View style={styles.header}>
          <Text style={styles.title}>KNIGHT TRAINING</Text>
          <Text style={styles.bossHealth}>Boss Health: {bossHealth}/100</Text>
        </View>

        {/* Projectile controls */}
        <View style={styles.controls}>
          <Text style={styles.label}>Velocity (m/s):</Text>
          <TextInput
            style={styles.input}
            value={velocity}
            onChangeText={setVelocity}
            keyboardType="numeric"
          />

          <Text style={styles.label}>Angle (°):</Text>
          <TextInput
            style={styles.input}
            value={angle}
            onChangeText={setAngle}
            keyboardType="numeric"
          />

          <Text style={styles.label}>Gravity (m/s²):</Text>
          <TextInput
            style={styles.input}
            value={gravity}
            onChangeText={setGravity}
            keyboardType="numeric"
          />

          <Text style={styles.label}>Target Distance (±5m):</Text>
          <Text style={styles.valueText}>{targetDistance} m</Text>

          <TouchableOpacity onPress={handleSimulate} style={styles.simButton}>
            <Text style={styles.simButtonText}>SIMULATE</Text>
          </TouchableOpacity>
        </View>

        {/* Simple "canvas" area for the trajectory */}
        <View style={styles.chartContainer}>
          <Svg width={width} height={height}>
            {/* A baseline (ground) line */}
            <Line
              x1="0"
              y1={height}
              x2={width}
              y2={height}
              stroke="gray"
              strokeWidth={2}
            />
            {/* The actual path of the projectile */}
            {pathData && (
              <Path d={pathData} fill="none" stroke="blue" strokeWidth={3} />
            )}
          </Svg>
        </View>

        {/* Back button */}
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>Back to Boss Screen</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)", // dark overlay on top of boss image
    padding: 16,
  },
  header: {
    alignItems: "center",
    marginTop: 40,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    color: "#FFD700",
    fontWeight: "bold",
    textShadowColor: "#000",
    textShadowRadius: 5,
  },
  bossHealth: {
    fontSize: 18,
    color: "#FF4444",
    marginTop: 10,
  },
  controls: {
    backgroundColor: "#FFF5E1",
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 8,
    borderWidth: 2,
    borderColor: "#773737",
  },
  label: {
    color: "#773737",
    marginTop: 10,
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
    marginTop: 4,
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  simButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    textShadowColor: "black",
    textShadowRadius: 9,
  },
  chartContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  backButton: {
    marginTop: 20,
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
