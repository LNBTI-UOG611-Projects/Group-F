
import { initializeApp } from "firebase/app";

import {
  getAuth,
  connectAuthEmulator
} from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID
};

if (
  import.meta.env.DEV &&
  import.meta.env.VITE_USE_FIREBASE_EMULATOR !== "true"
) {
  throw new Error(
    "Local development requires the Firebase Auth Emulator."
  );
}

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

if (
  import.meta.env.DEV &&
  import.meta.env.VITE_USE_FIREBASE_EMULATOR === "true"
) {
  connectAuthEmulator(
    auth,
    "http://127.0.0.1:9099"
  );
}

export { auth };
