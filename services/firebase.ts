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
  type User,
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
  console.log("Current config:", {
    projectId: firebaseConfig.projectId,
    authDomain: firebaseConfig.authDomain,
    apiKey: firebaseConfig.apiKey ? "present" : "missing",
  });
  console.log("Environment variables:", {
    VITE_FIREBASE_PROJECT_ID: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    VITE_FIREBASE_AUTH_DOMAIN: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    VITE_FIREBASE_API_KEY: import.meta.env.VITE_FIREBASE_API_KEY ? "present" : "missing",
  });
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

export async function signOutUser(): Promise<void> {
  await signOut(auth);
}

export { onAuthStateChanged };
