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
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";

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
  const user = await getCurrentUser();
  if (!user.clubID) {
    return null;
  }

  const clubDoc = await getDoc(doc(db, "clubs", user.clubID));
  if (clubDoc.exists()) {
    return clubDoc.data() as Club;
  }
  return null;
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

  const adminQuery = query(
    collection(db, "Club_Admins"),
    where("email", "==", auth.currentUser.email)
  );

  const querySnapshot = await getDocs(adminQuery);
  return !querySnapshot.empty;
}

export async function getCurrentClubAdmin() {
  if (!auth.currentUser || !auth.currentUser.email) {
    throw new Error("No user is currently logged in");
  }

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
  if (!(await isCurrentUserClubAdmin())) {
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
}

// Web admin functions
export async function isCurrentUserWebAdmin() {
  // First check if user is authenticated
  if (!auth.currentUser) {
    return false;
  }

  try {
    // Check if user document exists in Web_Admin collection using direct document check
    // which is more efficient and less likely to have permission issues
    const adminDoc = await getDoc(doc(db, "Web_Admin", auth.currentUser.uid));
    return adminDoc.exists();
  } catch (error) {
    console.error("Error checking web admin status:", error);
    return false; // Return false on error
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
}

export async function getEvaluationsForClub(clubId: string) {
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
}

// Add this function
export async function getCurrentUserEvaluations() {
  if (!auth.currentUser) {
    throw new Error("No user is currently logged in");
  }

  return getEvaluationsForUser(auth.currentUser.uid);
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

    // Count evaluations
    const evaluationsQuery = query(
      collection(db, "evaluations"),
      where("userId", "==", doc.id)
    );
    const evaluationSnapshot = await getDocs(evaluationsQuery);

    return {
      id: doc.id,
      username: userData.username || "Unknown User",
      email: userData.email,
      isVerified: userData.isVerified,
      joinedDate: userData.createdAt,
      evaluationCount: evaluationSnapshot.size,
    };
  });

  return Promise.all(memberPromises);
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
