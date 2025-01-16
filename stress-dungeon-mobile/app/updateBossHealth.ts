import { doc, getDoc, updateDoc } from "firebase/firestore";
import { router } from "expo-router";
import { auth, db } from "../firebaseconfig";

export async function updateBossHealth(damage: number): Promise<void> {
  const user = auth.currentUser;
  if (!user) return;

  const bossDocRef = doc(db, "boss", user.uid);

  try {
    // Fetch the current health
    const bossDoc = await getDoc(bossDocRef);
    const currentHealth = bossDoc.data()?.BossHealth ?? 100;

    // Calculate the new health
    const newHealth = Math.max(currentHealth + damage, 0); // Ensure health doesn't go below 0

    // Update Firestore with the new health
    await updateDoc(bossDocRef, { BossHealth: newHealth });

    // If the new health is 0 or less, navigate to the win screen
    if (newHealth <= 0) {
      router.replace("/win");
    }
  } catch (error) {
    console.error("Error updating boss health:", error);
  }
}
