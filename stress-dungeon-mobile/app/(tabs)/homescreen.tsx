import React, { useEffect } from "react";
import {
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  Text,
  Alert,
} from "react-native";
import { auth } from "../../firebaseconfig";
import {
  useAuthRequest,
  makeRedirectUri,
  ResponseType,
} from "expo-auth-session";
import {
  getAuth,
  signInWithCredential,
  GoogleAuthProvider,
} from "firebase/auth";

// Google Auth configuration
const discovery = {
  authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
  tokenEndpoint: "https://oauth2.googleapis.com/token",
  revocationEndpoint: "https://oauth2.googleapis.com/revoke",
};

export default function HomeScreen() {
  // Configure the Google Auth request
  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId:
        "669470169524-hk9mutidioh7fjafeic40rm2obfgu08l.apps.googleusercontent.com",
      redirectUri: makeRedirectUri({
        scheme: "stress-dungeon-mobile",
      }),
      responseType: ResponseType.IdToken,
      scopes: ["profile", "email"],
    },
    discovery // <-- Pass discovery as the second argument
  );

  // Handle the Google Sign-In response
  useEffect(() => {
    if (response?.type === "success") {
      const { id_token } = response.params;

      // Create a credential with the ID token
      const credential = GoogleAuthProvider.credential(id_token);

      // Sign in with Firebase
      signInWithCredential(auth, credential)
        .then((userCredential) => {
          const user = userCredential.user;
          Alert.alert(
            "Login Successful",
            `Welcome, ${user.displayName || user.email}!`
          );
        })
        .catch((error) => {
          Alert.alert("Login Failed", error.message);
        });
    }
  }, [response]);

  return (
    <View style={styles.container}>
      {/* Background Image */}
      <Image
        source={require("../../assets/images/landingPage.png")}
        style={styles.backgroundImage}
        resizeMode="cover"
      />

      {/* Logo Section */}
      <View style={styles.logoContainer}>
        <Image
          source={require("../../assets/images/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* Buttons Section */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            promptAsync();
          }}
        >
          <Text style={styles.buttonText}>LOGIN</Text>
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
    textShadowColor: "black",
    textShadowRadius: 9,
  },
});
