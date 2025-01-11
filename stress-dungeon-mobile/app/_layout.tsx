// app/_layout.tsx
import React, { useState, useEffect } from "react";
import { Slot, useRouter } from "expo-router";
import SplashScreen from "./splashScreen"; // Your old splash screen
import HomeScreen from ".";

export default function Layout() {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Simulate a loading process (e.g., fetching data)
    const timer = setTimeout(() => {
      setIsLoading(false);
      // If you wanted to skip directly to introduction, you could do:
      // router.replace("/introduction");
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    // Show your animated splash screen or GIF
    return <SplashScreen />;
  }

  // Once loading finishes, render the matched route (index, introduction, etc.)
  return <Slot />;
}
