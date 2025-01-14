// app/index.tsx
import React, { useState } from "react";
import {
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  Text,
  Alert,
  TextInput,
} from "react-native";

// Firebase Auth & Firestore
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore"; // <-- import Firestore methods
import { auth, db } from "../firebaseconfig"; // <-- your firebase config
import CloudAnimation from "./cloudAnimation";
import { useRouter } from "expo-router";

export default function HomeScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isAnimating, setIsAnimating] = useState(false);

  // Use expo-router's navigation
  const router = useRouter();

  // Function to handle login
  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Optionally, if you want to ensure they have a Firestore doc:
      // await setDoc(doc(db, "boss", user.uid), {
      //   UserID: user.uid,
      //   BossHealth: 100,
      // }, { merge: true });

      setIsAnimating(true); // Start cloud animation
    } catch (error: any) {
      Alert.alert("Login Failed", error.message);
    }
  };

  // Function to handle sign up (register)
  const handleSignUp = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // After successful sign-up, create a boss doc for this user
      await setDoc(doc(db, "boss", user.uid), {
        UserID: user.uid,
        BossHealth: 100, // default health, adjust as desired
      });

      setIsAnimating(true); // Start cloud animation
    } catch (error: any) {
      Alert.alert("Sign Up Failed", error.message);
    }
  };

  // Function to handle animation completion
  const handleAnimationComplete = () => {
    // Navigate to the introduction screen after the animation
    router.push("/introductionscreen");
  };

  return (
    <View style={styles.container}>
      {/* Background Image */}
      <Image
        source={require("../assets/images/landingPage.png")}
        style={styles.backgroundImage}
        resizeMode="cover"
      />

      {/* Show Cloud Animation if Animating */}
      {isAnimating && (
        <CloudAnimation onAnimationComplete={handleAnimationComplete} />
      )}

      {/* Only show form if animation hasn't started */}
      {!isAnimating && (
        <>
          {/* Logo Section */}
          <View style={styles.logoContainer}>
            <Image
              source={require("../assets/images/logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          {/* Email Input */}
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          {/* Password Input */}
          <TextInput
            style={styles.input}
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          {/* Buttons Section */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={handleLogin}>
              <Text style={styles.buttonText}>LOGIN</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={handleSignUp}>
              <Text style={styles.buttonText}>SIGN UP</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
  },
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  logoContainer: {
    flex: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 200,
    height: 200,
  },
  input: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
    width: "80%",
    alignSelf: "center",
    borderWidth: 1,
    borderColor: "#ccc",
  },
  buttonContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 50,
  },
  button: {
    backgroundColor: "#DDA15E",
    paddingVertical: 15,
    paddingHorizontal: 50,
    borderRadius: 20,
    borderWidth: 4,
    borderColor: "#773737",
    marginVertical: 10,
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
    textShadowColor: "black",
    textShadowRadius: 9,
  },
});
