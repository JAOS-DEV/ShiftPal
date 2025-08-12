import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from "firebase/firestore";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  updatePassword,
  updateEmail,
  type User,
  type UserCredential,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string,
  messagingSenderId: import.meta.env
    .VITE_FIREBASE_MESSAGING_SENDER_ID as string,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID as string,
};

// Validate Firebase configuration
if (!firebaseConfig.projectId) {
  console.error(
    "❌ Firebase projectId is missing. Check your environment variables."
  );
}

// Initialize Firebase app (singleton by module scope)
const app = initializeApp(firebaseConfig);

// Initialize Analytics (only in production to avoid development noise)
export const analytics =
  typeof window !== "undefined" && import.meta.env.PROD
    ? getAnalytics(app)
    : null;

export const auth = getAuth(app);
auth.useDeviceLanguage();

// Initialize Firestore with persistent cache
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
  }),
});

const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: "select_account" });

export async function signInWithGoogle(): Promise<User> {
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    // Fallback to redirect if popup fails (CSP, blockers, third-party cookies)
    await signInWithRedirect(auth, provider);
    const redirectResult = await getRedirectResult(auth);
    if (!redirectResult) {
      throw error instanceof Error ? error : new Error("Sign-in failed");
    }
    return redirectResult.user;
  }
}

// Email/Password Authentication Functions
export async function signUpWithEmail(
  email: string,
  password: string
): Promise<UserCredential> {
  return createUserWithEmailAndPassword(auth, email, password);
}

export async function signInWithEmail(
  email: string,
  password: string
): Promise<UserCredential> {
  return signInWithEmailAndPassword(auth, email, password);
}

export async function sendPasswordReset(email: string): Promise<void> {
  return sendPasswordResetEmail(auth, email);
}

export async function sendEmailVerificationToUser(user: User): Promise<void> {
  return sendEmailVerification(user);
}

export async function updateUserPassword(newPassword: string): Promise<void> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("No user is currently signed in");
  }
  return updatePassword(user, newPassword);
}

export async function updateUserEmail(newEmail: string): Promise<void> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("No user is currently signed in");
  }
  return updateEmail(user, newEmail);
}

// Helper function to check if user can access Pro features
export function canAccessProFeatures(user: User | null): boolean {
  return user?.emailVerified === true;
}

export async function signOutUser(): Promise<void> {
  await signOut(auth);
}

export { onAuthStateChanged };
