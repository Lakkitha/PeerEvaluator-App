import { auth, db } from "../firebase";
import {
  doc,
  getDoc,
  getDocs,
  collection,
  query,
  where,
  updateDoc,
  setDoc,
  addDoc,
  orderBy,
  deleteDoc,
  writeBatch,
} from "firebase/firestore";
import {
  User,
  Club,
  ClubAdmin,
  WebAdmin,
  Evaluation,
  SharedData,
} from "../models/firebase";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  updatePassword,
} from "firebase/auth";

// User-related functions
export async function getCurrentUser() {
  if (!auth.currentUser) {
    throw new Error("No user is currently logged in");
  }

  const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
  if (userDoc.exists()) {
    return userDoc.data() as User;
  } else {
    throw new Error("User document not found");
  }
}

// Update the isUserVerified function
export async function isUserVerified() {
  if (!auth.currentUser) {
    return false;
  }

  const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
  if (!userDoc.exists()) {
    return false;
  }

  return userDoc.data().isVerified === true;
}

export async function getUserClub() {
  if (!auth.currentUser) {
    return null;
  }

  try {
    // Check if the user document exists first
    const userDocRef = doc(db, "users", auth.currentUser.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      console.log("User document does not exist, may need to create one");
      // Return null instead of throwing an error
      return null;
    }
    
    const userData = userDoc.data();
    if (!userData.clubID) {
      return null;
    }

    const clubDoc = await getDoc(doc(db, "clubs", userData.clubID));
    if (clubDoc.exists()) {
      return clubDoc.data() as Club;
    }
    return null;
  } catch (error) {
    console.error("Error getting user club:", error);
    return null;
  }
}

export async function updateUserLevel(
  newLevel: "Beginner" | "Intermediate" | "Advanced"
) {
  if (!auth.currentUser) {
    throw new Error("No user is currently logged in");
  }

  await updateDoc(doc(db, "users", auth.currentUser.uid), {
    userLevel: newLevel,
    updatedAt: new Date().toISOString(),
  });

  // Update shared data if you're using that collection
  await updateSharedData();
}

export async function updateUserClub(clubID: string) {
  if (!auth.currentUser) {
    throw new Error("No user is currently logged in");
  }

  await updateDoc(doc(db, "users", auth.currentUser.uid), {
    clubID: clubID,
    updatedAt: new Date().toISOString(),
  });

  // Update shared data if you're using that collection
  await updateSharedData();
}

// Function to update shared data
async function updateSharedData() {
  if (!auth.currentUser) return;

  try {
    const user = await getCurrentUser();

    const sharedData: SharedData = {
      userID: auth.currentUser.uid,
      username: user.username,
      clubID: user.clubID || "",
      userLevel: user.userLevel,
    };

    await setDoc(doc(db, "sharedData", auth.currentUser.uid), sharedData);
  } catch (error) {
    console.error("Error updating shared data:", error);
  }
}

// Club admin functions
export async function isCurrentUserClubAdmin() {
  if (!auth.currentUser) {
    return false;
  }

  try {
    const adminQuery = query(
      collection(db, "Club_Admins"),
      where("email", "==", auth.currentUser.email)
    );

    const querySnapshot = await getDocs(adminQuery);
    return !querySnapshot.empty;
  } catch (error) {
    // Return false instead of throwing an error
    console.error("Error checking club admin status:", error);
    return false;
  }
}

export async function getCurrentClubAdmin() {
  if (!auth.currentUser || !auth.currentUser.email) {
    throw new Error("No user is currently logged in");
  }

  try {
    const adminQuery = query(
      collection(db, "Club_Admins"),
      where("email", "==", auth.currentUser.email)
    );

    const querySnapshot = await getDocs(adminQuery);
    if (!querySnapshot.empty) {
      const adminDoc = querySnapshot.docs[0];
      return { id: adminDoc.id, ...(adminDoc.data() as ClubAdmin) };
    }

    throw new Error("Admin not found");
  } catch (error) {
    console.error("Error getting club admin:", error);
    // Rethrow with a more user-friendly message
    throw new Error(
      "Could not verify club admin status. Please try again later."
    );
  }
}

export async function verifyUser(userID: string) {
  // First check if current user is a club admin
  if (!(await isCurrentUserClubAdmin())) {
    throw new Error("Only club admins can verify users");
  }

  await updateDoc(doc(db, "users", userID), {
    isVerified: true,
    updatedAt: new Date().toISOString(),
  });
}

export async function getUnverifiedUsers() {
  try {
    // Check if the user is a club admin
    const isAdmin = await isCurrentUserClubAdmin();
    if (!isAdmin) {
      throw new Error("Only club admins can view unverified users");
    }

    // Get current admin's club
    const admin = await getCurrentClubAdmin();

    // Get unverified users for this club
    const usersQuery = query(
      collection(db, "users"),
      where("clubID", "==", admin.clubID),
      where("isVerified", "==", false)
    );

    const userSnapshot = await getDocs(usersQuery);
    return userSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as User),
    }));
  } catch (error) {
    console.error("Error getting unverified users:", error);
    // Return empty array instead of throwing error
    return [];
  }
}

// Web admin functions
export async function isCurrentUserWebAdmin() {
  // First check if user is authenticated
  if (!auth.currentUser) {
    return false;
  }

  try {
    // Use a different approach - check if the user's UID matches any document in Web_Admin
    // The security rules should allow a user to read their own document
    const adminDoc = await getDoc(doc(db, "Web_Admin", auth.currentUser.uid));
    return adminDoc.exists();
  } catch (error) {
    // Silently handle permission errors
    if (process.env.NODE_ENV === "development") {
      // Log the error only in development, but don't show it as a console.error to avoid red noise
      console.log(
        "Admin check info:",
        error instanceof Error ? error.message : String(error)
      );
    }
    return false;
  }
}

export async function getAllClubs() {
  const clubsQuery = query(collection(db, "clubs"));
  const querySnapshot = await getDocs(clubsQuery);

  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Club),
  }));
}

// Update this function with a more functional implementation
export async function createClubAdmin(adminData: {
  adminName: string;
  email: string;
  password: string;
  clubID: string;
}) {
  try {
    // Create the user with email and password
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      adminData.email,
      adminData.password
    );

    const now = new Date().toISOString();

    // Create the admin document
    await setDoc(doc(db, "Club_Admins", userCredential.user.uid), {
      adminName: adminData.adminName,
      email: adminData.email,
      clubID: adminData.clubID,
      createdAt: now,
      updatedAt: now,
    });

    // Update the club with this admin's ID - fix the collection name
    await updateDoc(doc(db, "clubs", adminData.clubID), {
      clubAdminID: userCredential.user.uid,
      updatedAt: now,
    });

    return { success: true, uid: userCredential.user.uid };
  } catch (error) {
    console.error("Error creating club admin:", error);
    throw error;
  }
}

// Evaluation functions
export async function getEvaluationsForUser(userId: string) {
  try {
    // Try the query with ordering first
    const evaluationsQuery = query(
      collection(db, "evaluations"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc") // Sort by newest first
    );

    const querySnapshot = await getDocs(evaluationsQuery);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Evaluation),
    }));
  } catch (error: any) {
    // If it's specifically an index error (index is building)
    if (
      error?.message?.includes("The query requires an index") ||
      error?.message?.includes("currently building")
    ) {
      console.warn(
        "Firestore index is building. Using alternative method to fetch evaluations."
      );

      // Alternative: Get all user evaluations without ordering first
      try {
        // Use only the filter without the orderBy
        const fallbackQuery = query(
          collection(db, "evaluations"),
          where("userId", "==", userId)
        );

        const fallbackSnapshot = await getDocs(fallbackQuery);

        // Get all documents and sort them manually in JavaScript
        const evaluations = fallbackSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Evaluation),
        }));

        // Sort manually by createdAt in descending order
        return evaluations.sort((a, b) => {
          // Handle missing createdAt field safely
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA; // Descending order
        });
      } catch (fallbackError) {
        console.error("Alternative method also failed:", fallbackError);
        return []; // Return empty array as a last resort
      }
    }

    // For other errors, just log and throw
    console.error("Error fetching evaluations:", error);
    throw error;
  }
}

export async function getEvaluationsForClub(clubId: string) {
  try {
    // Check if current user is a club admin for this club
    const admin = await getCurrentClubAdmin();
    if (admin.clubID !== clubId) {
      throw new Error("You can only view evaluations for your own club");
    }

    const evaluationsQuery = query(
      collection(db, "evaluations"),
      where("clubID", "==", clubId)
    );

    const querySnapshot = await getDocs(evaluationsQuery);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Evaluation),
    }));
  } catch (error) {
    console.error("Error fetching evaluations for club:", error);
    // Return an empty array instead of throwing to prevent dashboard errors
    return [];
  }
}

// Add this function
export async function getCurrentUserEvaluations() {
  if (!auth.currentUser) {
    throw new Error("No user is currently logged in");
  }

  try {
    return await getEvaluationsForUser(auth.currentUser.uid);
  } catch (error: any) {
    // Check if it's an index error
    if (error?.message?.includes("The query requires an index")) {
      console.warn(
        "Missing Firestore index. Please visit the URL in the error message to create it.",
        error
      );
      // Return empty array as fallback
      return [];
    }
    // Otherwise rethrow
    throw error;
  }
}

// Add this function
export async function updateUserProfilePicture(photoURL: string) {
  if (!auth.currentUser) {
    throw new Error("No user is currently logged in");
  }

  // Update auth profile
  await updateProfile(auth.currentUser, {
    photoURL: photoURL,
  });

  // Update in Firestore
  await updateDoc(doc(db, "users", auth.currentUser.uid), {
    userPicture: photoURL,
    updatedAt: new Date().toISOString(),
  });

  // Update in shared data
  await updateSharedData();
}

// Add this function
export async function getClubById(clubId: string) {
  const clubDoc = await getDoc(doc(db, "clubs", clubId));
  if (!clubDoc.exists()) {
    throw new Error("Club not found");
  }

  return { id: clubDoc.id, ...(clubDoc.data() as Club) };
}

// Add this function
export async function createClub(clubName: string) {
  if (!auth.currentUser) {
    throw new Error("You must be logged in to create a club");
  }

  // Check if the current user is a web admin
  const isAdmin = await isCurrentUserWebAdmin();
  if (!isAdmin) {
    throw new Error("Only web administrators can create clubs");
  }

  const now = new Date().toISOString();

  const clubData = {
    clubName,
    clubAdminID: "", // No admin initially
    createdAt: now,
    updatedAt: now,
  };

  try {
    const clubRef = await addDoc(collection(db, "clubs"), clubData);
    return { id: clubRef.id, ...clubData };
  } catch (error) {
    console.error("Error creating club:", error);
    throw new Error("Failed to create the club. Please try again later.");
  }
}

// Add these functions to your firebase.ts service

// Check if any web admin exists in the system
export async function checkWebAdminExists() {
  const adminQuery = query(collection(db, "Web_Admin")); // Changed from "mainWebAdmins"
  const snapshot = await getDocs(adminQuery);
  return !snapshot.empty;
}

// Get all web admins
export async function getAllWebAdmins() {
  // Ensure user is a web admin
  if (!(await isCurrentUserWebAdmin())) {
    throw new Error("Only web admins can view all web admins");
  }

  const webAdminsQuery = query(collection(db, "Web_Admin")); // Changed from "mainWebAdmins"
  const querySnapshot = await getDocs(webAdminsQuery);

  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as WebAdmin),
  }));
}

// Create a web admin (only for the initial setup or by existing web admins)
export async function createWebAdmin(adminData: {
  adminName: string;
  email: string;
  password: string;
}) {
  const webAdminExists = await checkWebAdminExists();

  // If web admins already exist, only another web admin can create more
  if (webAdminExists) {
    const isAdmin = await isCurrentUserWebAdmin();
    if (!isAdmin) {
      throw new Error("Only existing web admins can create new web admins");
    }
  }

  // Create user account
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    adminData.email,
    adminData.password
  );

  // Update profile
  await updateProfile(userCredential.user, {
    displayName: adminData.adminName,
  });

  const now = new Date().toISOString();

  // Create web admin document
  await setDoc(doc(db, "Web_Admin", userCredential.user.uid), {
    adminName: adminData.adminName,
    email: adminData.email,
    createdAt: now,
    updatedAt: now,
  });

  return {
    id: userCredential.user.uid,
    adminName: adminData.adminName,
    email: adminData.email,
  };
}

// Add this function
export async function getAllClubAdmins() {
  // Ensure user is a web admin
  if (!(await isCurrentUserWebAdmin())) {
    throw new Error("Only web admins can view all club admins");
  }

  const adminsQuery = query(collection(db, "Club_Admins"));
  const querySnapshot = await getDocs(adminsQuery);

  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as ClubAdmin),
  }));
}

// Add these functions to your firebase.ts file

export async function getClubMembers(clubId: string) {
  try {
    // Verify current user is a club admin
    const admin = await getCurrentClubAdmin();
    if (admin.clubID !== clubId) {
      throw new Error("You can only view members from your own club");
    }

    // Get all users that belong to this club and are verified
    const usersQuery = query(
      collection(db, "users"),
      where("clubID", "==", clubId),
      where("isVerified", "==", true)
    );

    const querySnapshot = await getDocs(usersQuery);

    // For each user, get their evaluation count
    const memberPromises = querySnapshot.docs.map(async (doc) => {
      const userData = doc.data();

      // Get evaluation count safely - handle permissions errors
      let evaluationCount = 0;
      try {
        // Count evaluations
        const evaluationsQuery = query(
          collection(db, "evaluations"),
          where("userId", "==", doc.id)
        );
        const evaluationSnapshot = await getDocs(evaluationsQuery);
        evaluationCount = evaluationSnapshot.size;
      } catch (evalError) {
        // Don't log permission errors in production
        if (process.env.NODE_ENV === 'development') {
          console.log(`Couldn't access evaluations for user ${doc.id} (this is normal if permissions are limited)`);
        }
        evaluationCount = 0; // Default to 0 if there's a permission error
      }

      return {
        id: doc.id,
        username: userData.username || "Unknown User",
        email: userData.email,
        isVerified: userData.isVerified,
        joinedDate: userData.createdAt,
        evaluationCount: evaluationCount,
      };
    });

    return Promise.all(memberPromises);
  } catch (error) {
    console.error("Error getting club members:", error);
    // Return empty array instead of throwing
    return [];
  }
}

export async function getUserDetails(userId: string) {
  // Get the user document
  const userDoc = await getDoc(doc(db, "users", userId));

  if (!userDoc.exists()) {
    throw new Error("User not found");
  }

  const userData = userDoc.data();
  return {
    username: userData.username,
    email: userData.email,
    clubID: userData.clubID,
    isVerified: userData.isVerified,
    joinedDate: userData.createdAt,
  };
}

// Add this function to your services/firebase.ts file

export async function deleteClub(clubId: string) {
  if (!auth.currentUser) {
    throw new Error("You must be logged in to delete a club");
  }

  // Check if the current user is a web admin
  const isAdmin = await isCurrentUserWebAdmin();
  if (!isAdmin) {
    throw new Error("Only web administrators can delete clubs");
  }

  try {
    // Check if club exists
    const clubDoc = await getDoc(doc(db, "clubs", clubId));
    if (!clubDoc.exists()) {
      throw new Error("Club not found");
    }

    const clubData = clubDoc.data();

    // Step 1: Update related club admin document if exists
    if (clubData.clubAdminID) {
      try {
        await updateDoc(doc(db, "Club_Admins", clubData.clubAdminID), {
          clubID: "",
          updatedAt: new Date().toISOString(),
        });
        console.log(`Updated club admin ${clubData.clubAdminID}`);
      } catch (adminError) {
        console.error("Error updating club admin:", adminError);
        // Continue with deletion process even if updating admin fails
      }
    }

    // We'll use Cloud Functions or admin endpoints to handle evaluation updates
    // for now, just proceed with club deletion

    // Step 2: Find all users associated with this club and update them
    try {
      const usersQuery = query(
        collection(db, "users"),
        where("clubID", "==", clubId)
      );

      const userSnapshots = await getDocs(usersQuery);

      if (userSnapshots.size > 0) {
        const userBatch = writeBatch(db);

        userSnapshots.forEach((userDoc) => {
          userBatch.update(doc(db, "users", userDoc.id), {
            clubID: "",
            isVerified: false,
            updatedAt: new Date().toISOString(),
          });
        });

        await userBatch.commit();
        console.log(`Updated ${userSnapshots.size} users`);
      }
    } catch (userError) {
      console.error("Error updating users:", userError);
      // Continue even if this fails, as we will still delete the club
    }

    // Step 3: Finally delete the club document
    await deleteDoc(doc(db, "clubs", clubId));
    console.log(`Deleted club ${clubId}`);

    return { success: true };
  } catch (error) {
    console.error("Error deleting club:", error);
    throw error;
  }
}

// Add this function to update user password
export async function updateUserPassword(newPassword: string) {
  if (!auth.currentUser) {
    throw new Error("No user is currently logged in");
  }

  try {
    await updatePassword(auth.currentUser, newPassword);
    return { success: true };
  } catch (error) {
    console.error("Error updating password:", error);
    throw error;
  }
}

// Add this function to update user settings
export async function updateUserSettings(settings: {
  shareEvaluations?: boolean;
  showInLeaderboards?: boolean;
  emailNotifications?: boolean;
  pushNotifications?: boolean;
}) {
  if (!auth.currentUser) {
    throw new Error("No user is currently logged in");
  }

  try {
    await updateDoc(doc(db, "users", auth.currentUser.uid), {
      settings: settings,
      updatedAt: new Date().toISOString(),
    });
    return { success: true };
  } catch (error) {
    console.error("Error updating user settings:", error);
    throw error;
  }
}

// Add this function to update username
export async function updateUsername(newUsername: string) {
  if (!auth.currentUser) {
    throw new Error("No user is currently logged in");
  }

  try {
    // Update display name in auth
    await updateProfile(auth.currentUser, {
      displayName: newUsername,
    });

    // Update in Firestore
    await updateDoc(doc(db, "users", auth.currentUser.uid), {
      username: newUsername,
      updatedAt: new Date().toISOString(),
    });

    // Update in shared data
    await updateSharedData();

    return { success: true };
  } catch (error) {
    console.error("Error updating username:", error);
    throw error;
  }
}
