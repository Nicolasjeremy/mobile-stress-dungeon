// app/context/BossHealthContext.tsx (example path)
import React, { createContext, useContext, useState, ReactNode } from "react";

// 1) Define the shape of our context data
type BossHealthContextType = {
  bossHealth: number;
  setBossHealth: (newHealth: number) => void;
};

// 2) Create the context with default empty values
const BossHealthContext = createContext<BossHealthContextType>({
  bossHealth: 100,
  setBossHealth: () => {},
});

// 3) Create a provider component that holds the state
export function BossHealthProvider({ children }: { children: ReactNode }) {
  const [bossHealth, setBossHealth] = useState(100);

  return (
    <BossHealthContext.Provider value={{ bossHealth, setBossHealth }}>
      {children}
    </BossHealthContext.Provider>
  );
}

// 4) A helper hook to use our context in any component
export function useBossHealth() {
  return useContext(BossHealthContext);
}
