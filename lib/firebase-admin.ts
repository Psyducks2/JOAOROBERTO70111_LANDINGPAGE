import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";
import { getStorage, Storage } from "firebase-admin/storage";
import type { Auth } from "firebase-admin/auth";

function formatPrivateKey(key: string | undefined): string | undefined {
  if (!key) return undefined;
  return key.replace(/\\n/g, "\n");
}

const projectId =
  process.env.FIREBASE_ADMIN_PROJECT_ID ||
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
  "joaoroberto70111-5f51e";
const clientEmail =
  process.env.FIREBASE_ADMIN_CLIENT_EMAIL ||
  "firebase-adminsdk-fbsvc@joaoroberto70111-5f51e.iam.gserviceaccount.com";
const privateKey = formatPrivateKey(process.env.FIREBASE_ADMIN_PRIVATE_KEY);

let app: App | null = null;

if (!getApps().length) {
  try {
    if (clientEmail && privateKey) {
      app = initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
        storageBucket: `${projectId}.firebasestorage.app`,
      });
    } else {
      app = initializeApp();
    }
  } catch (error) {
    console.error("Firebase admin initialization error:", error);
  }
} else {
  app = getApps()[0];
}

let _cachedAuth: Auth | null = null;

export function getAdminAuth(): Auth | null {
  if (_cachedAuth) return _cachedAuth;
  if (!app) return null;
  try {
    // Dynamic require avoids loading jwks-rsa/jose at module import time
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { getAuth } = require("firebase-admin/auth");
    _cachedAuth = getAuth(app);
    return _cachedAuth;
  } catch (error) {
    console.warn("Notice: could not load firebase-admin/auth dynamically:", error);
    return null;
  }
}

// Proxied adminAuth for backward compatibility with existing code
export const adminAuth = new Proxy({} as Auth, {
  get(_target, prop) {
    const auth = getAdminAuth();
    if (!auth) {
      return () => {
        throw new Error("adminAuth is not available in current environment");
      };
    }
    const val = (auth as unknown as Record<string | symbol, unknown>)[prop];
    return typeof val === "function" ? val.bind(auth) : val;
  },
});

export const adminDb: Firestore | null = app ? getFirestore(app) : null;
export const adminStorage: Storage | null = app ? getStorage(app) : null;
