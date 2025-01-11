// firebaseConfig.ts
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your Firebase config from google-services.json
const firebaseConfig = {
    apiKey: "AIzaSyAmB4U9t6vMRXYv3gh9dwQW_6ndGWtvaX0",
    authDomain: "mobile-stress-dungeon.firebaseapp.com",
    projectId: "mobile-stress-dungeon",
    storageBucket: "mobile-stress-dungeon.firebasestorage.app",
    messagingSenderId: "669470169524",
    appId: "1:669470169524:web:5b2bb4d836dba104f27ae1",
    measurementId: "G-JKJ50P34FM"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
