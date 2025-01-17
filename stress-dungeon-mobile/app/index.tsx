import React, { useState, useEffect} from "react";
import {
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  Text,
  Alert,
  TextInput,
  Modal,
} from "react-native";
import * as Font from "expo-font";
import { ActivityIndicator } from "react-native";

// Firebase Auth & Firestore
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebaseconfig";
import CloudAnimation from "./cloudAnimation";
import { useRouter } from "expo-router";

export default function HomeScreen() {
  // State variables
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isAnimating, setIsAnimating] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [fontsLoaded, setFontsLoaded] = useState(false);

  // Router
  const router = useRouter();
  
  useEffect(() => {
    const loadFonts = async () => {
      await Font.loadAsync({
        LostSignal: require("../assets/fonts/LostSignalRegular.otf"),
        RetroGaming: require("../assets/fonts/RetroGaming.ttf"),
      });
      setFontsLoaded(true);
    };

    loadFonts();
  }, []);

  if (!fontsLoaded) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  // Function to handle login
  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      setIsAnimating(true);
      setIsModalVisible(false);
    } catch (error: any) {
      Alert.alert("Login Failed", error.message);
    }
  };

  // Function to handle sign-up
  const handleSignUp = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // After successful sign-up, create a Firestore doc
      await setDoc(doc(db, "boss", user.uid), {
        UserID: user.uid,
        BossHealth: 100,
      });

      setIsAnimating(true);
      setIsModalVisible(false);
    } catch (error: any) {
      Alert.alert("Sign Up Failed", error.message);
    }
  };

  // Function to handle animation completion
  const handleAnimationComplete = () => {
    router.push("/introductionscreen");
  };

  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/images/landingPage.png")}
        style={styles.backgroundImage}
        resizeMode="cover"
      />

      {isAnimating && (
        <CloudAnimation onAnimationComplete={handleAnimationComplete} />
      )}

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

          {/* Buttons Section */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                setIsSignUp(false);
                setIsModalVisible(true);
              }}
            >
              <Text style={[styles.buttonText, { fontFamily: "RetroGaming" }]}>LOGIN</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                setIsSignUp(true);
                setIsModalVisible(true);
              }}
            >
              <Text style={[styles.buttonText, { fontFamily: "RetroGaming" }]}>SIGN UP</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* Modal for Login/Sign-Up */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={[styles.modalTitle, { fontFamily: "LostSignal" }]}>
              {isSignUp ? "Sign Up" : "Login"}
            </Text>

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

            {/* Action Buttons */}
            <TouchableOpacity
              style={styles.modalButton}
              onPress={isSignUp ? handleSignUp : handleLogin}
            >
              <Text style={[styles.modalButtonText, { fontFamily: "RetroGaming" }]}>
                {isSignUp ? "Sign Up" : "Login"}
              </Text>
            </TouchableOpacity>

            {/* Close Modal Button */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setIsModalVisible(false)}
            >
              <Text style={[styles.closeButtonText, { fontFamily: "RetroGaming" }]}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    textShadowColor: "#000",
    textShadowOffset: { width: 3, height: 2 },
    textShadowRadius: 1,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    width: "100%",
    backgroundColor: "#f1f1f1",
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  modalButton: {
    backgroundColor: "#DDA15E",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginTop: 10,
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  closeButton: {
    marginTop: 10,
  },
  closeButtonText: {
    color: "#333",
    fontSize: 16,
  },
});