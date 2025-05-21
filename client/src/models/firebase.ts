// Firebase data models
export interface User {
  username: string;
  email: string;
  password?: string; // Only used for creation, never stored client-side
  clubID: string | null;
  userLevel: "Beginner" | "Intermediate" | "Advanced";
  userPicture: string | null;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  joinedDate?: string; // Alias for createdAt used in some components
}

export interface Club {
  clubName: string;
  clubAdminID: string;
  createdAt: string;
  updatedAt: string;
  id?: string; // Optional id for frontend use
}

export interface ClubAdmin {
  adminName: string;
  email: string;
  password?: string; // Only used for creation, never stored client-side
  clubID: string;
  createdAt: string;
  updatedAt: string;
}

export interface WebAdmin {
  adminName: string;
  email: string;
  password?: string; // Only used for creation, never stored client-side
  createdAt: string;
  updatedAt: string;
}

export interface Evaluation {
  userId: string;
  username?: string; // Optional field for displaying username
  clubID?: string; // Reference to club
  date: string;
  transcript: string;
  scores: {
    clarity: number;
    coherence: number;
    delivery: number;
    vocabulary: number;
    overallImpact: number;
  };
  feedback: string;
  suggestions: string[];
  createdAt: string;
}

// New interface for shared data (optional)
export interface SharedData {
  userID: string;
  username: string;
  clubID: string;
  userLevel: string;
}
