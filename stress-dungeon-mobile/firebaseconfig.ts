// firebaseConfig.ts
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAmB4U9t6vMRXYv3gh9dwQW_6ndGWtvaX0",
  authDomain: "mobile-stress-dungeon.firebaseapp.com",
  projectId: "mobile-stress-dungeon",
  storageBucket: "mobile-stress-dungeon.firebasestorage.app",
  messagingSenderId: "669470169524",
  appId: "1:669470169524:web:f5ccb63f8fc0ce06f27ae1",
  measurementId: "G-CT5ZZWD913"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
