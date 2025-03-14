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
  serverTimestamp,
  Timestamp,
  addDoc,
  orderBy,
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
    collection(db, "clubAdmins"),
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
    collection(db, "clubAdmins"),
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
  if (!auth.currentUser) {
    return false;
  }

  const adminQuery = query(
    collection(db, "mainWebAdmins"),
    where("email", "==", auth.currentUser.email)
  );

  const querySnapshot = await getDocs(adminQuery);
  return !querySnapshot.empty;
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
  // This would normally be done in a Cloud Function for security
  // For development purposes, we're implementing it client-side
  // In production, this should definitely be moved to a secure backend

  if (!(await isCurrentUserWebAdmin())) {
    throw new Error("Only web admins can create club admins");
  }

  try {
    // Create the user with email and password
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      adminData.email,
      adminData.password
    );

    const now = new Date().toISOString();

    // Create the admin document
    await setDoc(doc(db, "clubAdmins", userCredential.user.uid), {
      adminName: adminData.adminName,
      email: adminData.email,
      clubID: adminData.clubID,
      createdAt: now,
      updatedAt: now,
    });

    // Update the club with the admin ID
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
  // Only web admins can create clubs
  if (!(await isCurrentUserWebAdmin())) {
    throw new Error("Only web admins can create clubs");
  }

  const now = new Date().toISOString();

  const clubData = {
    clubName,
    clubAdminID: "", // No admin initially
    createdAt: now,
    updatedAt: now,
  };

  const clubRef = await addDoc(collection(db, "clubs"), clubData);
  return { id: clubRef.id, ...clubData };
}
