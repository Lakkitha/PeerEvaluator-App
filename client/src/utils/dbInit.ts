import {
  addDoc,
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";

/**
 * Initialize the database with starter data
 * WARNING: Only run this once, or it will create duplicate data
 */
export async function initializeDatabase() {
  try {
    console.log("Initializing database...");

    // Check if clubs collection exists
    const clubsQuery = query(collection(db, "clubs"));
    const clubSnapshot = await getDocs(clubsQuery);

    if (clubSnapshot.empty) {
      // Create initial clubs
      const clubs = [
        {
          clubName: "Public Speakers Club",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          clubName: "Toastmasters International",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          clubName: "College Debate Club",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      console.log("Creating clubs...");
      for (const club of clubs) {
        await addDoc(collection(db, "clubs"), club);
      }
    }

    // Check if web admin exists
    const webAdminQuery = query(
      collection(db, "Web_Admin"), // Changed from "mainWebAdmins"
      where("email", "==", "admin@peerevaluator.com")
    );
    const webAdminSnapshot = await getDocs(webAdminQuery);

    if (webAdminSnapshot.empty) {
      console.log("Creating web admin...");

      // Create web admin account
      try {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          "admin@peerevaluator.com",
          "adminpass123" // This should be changed immediately
        );

        // Create web admin document
        await setDoc(doc(db, "Web_Admin", userCredential.user.uid), {
          // Changed from "mainWebAdmins"
          adminName: "Super Admin",
          email: "admin@peerevaluator.com",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      } catch (error) {
        console.error("Error creating web admin:", error);
        console.log(
          "Web admin may already exist as a user, try adding them manually"
        );
      }
    }

    console.log("Database initialization complete");
  } catch (error) {
    console.error("Error initializing database:", error);
  }
}
