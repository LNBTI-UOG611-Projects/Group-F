
import "dotenv/config";
import { initializeApp, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

const projectId = process.env.FIREBASE_PROJECT_ID;

if (!projectId) {
  throw new Error("FIREBASE_PROJECT_ID is not configured");
}

const firebaseApp =
  getApps().length > 0
    ? getApps()[0]
    : initializeApp({ projectId });

const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);

export { auth, db };
