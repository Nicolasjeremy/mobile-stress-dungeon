import React from "react";
import { View, Image, StyleSheet, TouchableOpacity, Text } from "react-native";

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      {/* Background Image */}
      <Image
        source={require("../../assets/images/landingPage.png")} // Replace with your background image
        style={styles.backgroundImage}
        resizeMode="cover"
      />

      {/* Logo Section */}
      <View style={styles.logoContainer}>
        <Image
          source={require("../../assets/images/logo.png")} // Replace with your logo
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* Buttons Section */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>LOGIN</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>SIGN UP</Text>
        </TouchableOpacity>
      </View>
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
    width: 200, // Adjust to match your logo size
    height: 200,
  },
  buttonContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 50, // Add some space from the bottom
  },
  button: {
    backgroundColor: "#DDA15E", // Button background color
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
    elevation: 5, // Shadow for Android
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    textShadowColor: 'black',
    textShadowRadius: 9,
  }
});
