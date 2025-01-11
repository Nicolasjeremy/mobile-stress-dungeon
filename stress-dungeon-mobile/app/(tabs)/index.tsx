import React, { useState, useEffect } from "react";
import SplashScreen from "./splashScreen"; // Import the custom splash screen
import HomeScreen from "./homescreen"; // Main app screen
import LoadingPage from "./loadingPage";


export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate a loading process (e.g., fetching data)
    const timer = setTimeout(() => setIsLoading(false), 5000); // Adjust time as needed
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <SplashScreen />; // Show the splash screen while loading
  }

  return <HomeScreen />; // Show the main app after loading
}
