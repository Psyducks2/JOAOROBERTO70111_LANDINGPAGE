import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getAuth, Auth } from "firebase-admin/auth";
import { getFirestore, Firestore } from "firebase-admin/firestore";
import { getStorage, Storage } from "firebase-admin/storage";

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

export const adminAuth: Auth | null = app ? getAuth(app) : null;
export const adminDb: Firestore | null = app ? getFirestore(app) : null;
export const adminStorage: Storage | null = app ? getStorage(app) : null;
