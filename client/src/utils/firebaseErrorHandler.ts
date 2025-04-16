import { FirebaseError } from 'firebase/app';

/**
 * Handles Firebase errors and returns user-friendly error messages
 */
export function handleFirebaseError(error: unknown): string {
  if (error instanceof FirebaseError) {
    // Handle specific Firebase error codes
    switch (error.code) {
      case 'permission-denied':
      case 'functions/permission-denied':
        return "You don't have permission to access this resource. Please check your account privileges.";
      
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        return "Invalid email or password. Please try again.";
      
      case 'auth/email-already-in-use':
        return "This email is already registered. Please use a different email or try logging in.";
      
      case 'auth/weak-password':
        return "Please use a stronger password (at least 6 characters).";
      
      case 'auth/invalid-email':
        return "The email address is not valid. Please check and try again.";
      
      case 'auth/too-many-requests':
        return "Too many failed attempts. Please try again later or reset your password.";
      
      case 'auth/network-request-failed':
        return "Network error. Please check your connection and try again.";
        
      default:
        // For missing or insufficient permissions errors specifically
        if (error.message.includes('Missing or insufficient permissions')) {
          return "You don't have permission to access this resource. Please check your account privileges.";
        }
        return error.message || "An unexpected Firebase error occurred.";
    }
  }
  
  // For non-Firebase errors
  if (error instanceof Error) {
    return error.message;
  }
  
  return "An unknown error occurred.";
}

/**
 * Wrapper for Firebase service function calls that handles errors gracefully
 * @param fn The Firebase service function to call
 * @param fallbackValue The value to return if the function fails (optional)
 * @param errorHandler Custom error handler (optional)
 */
export async function safeFirebaseCall<T>(
  fn: () => Promise<T>,
  fallbackValue?: T,
  errorHandler?: (error: unknown) => void
): Promise<T | undefined> {
  try {
    return await fn();
  } catch (error) {
    const errorMessage = handleFirebaseError(error);
    
    // Log the error to console for debugging
    console.error("Firebase operation failed:", errorMessage, error);
    
    // Call the custom error handler if provided
    if (errorHandler) {
      errorHandler(error);
    }
    
    // Return the fallback value if provided
    return fallbackValue;
  }
}