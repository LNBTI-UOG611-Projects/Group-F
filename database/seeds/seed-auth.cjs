const fs = require("fs");
const path = require("path");

const { initializeApp } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");

// Never allow this script to run outside local emulators.
if (
  process.env.FIRESTORE_EMULATOR_HOST !== "127.0.0.1:8080" ||
  process.env.FIREBASE_AUTH_EMULATOR_HOST !== "127.0.0.1:9099"
) {
  console.error("STOP: Both Firebase emulators must be configured.");
  process.exit(1);
}

const password = process.env.DEMO_TEST_PASSWORD;

if (!password || password.length < 8) {
  console.error("Set DEMO_TEST_PASSWORD to at least 8 characters.");
  process.exit(1);
}

// Read the existing project ID.
const configPath = path.resolve(__dirname, "../../.firebaserc");
const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
const projectId = config.projects.default;

if (!projectId) {
  throw new Error("Firebase project ID not found.");
}

const app = initializeApp({ projectId });
const auth = getAuth(app);
const db = getFirestore(app);

// All accounts and email addresses below are fictional.
const testUsers = [
  {
    uid: "demo-admin",
    email: "admin@example.test",
    displayName: "Demo Main Admin",
    role: "main_admin"
  },
  {
    uid: "demo-subadmin",
    email: "subadmin@example.test",
    displayName: "Demo Sub Admin",
    role: "sub_admin"
  },
  {
    uid: "demo-customer-user",
    email: "customer@example.test",
    displayName: "Demo Customer",
    role: "customer",
    customerId: "demo-customer"
  },
  {
    uid: "demo-employee-user",
    email: "employee@example.test",
    displayName: "Demo Employee",
    role: "employee",
    employeeId: "demo-employee"
  }
];

async function seedAuth() {
  for (const user of testUsers) {
    try {
      await auth.getUser(user.uid);
      console.log(`Already exists: ${user.role}`);
    } catch (error) {
      if (error.code !== "auth/user-not-found") {
        throw error;
      }

      await auth.createUser({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        password
      });

      console.log(`Created: ${user.role}`);
    }

    // Firestore profile, using exactly the same UID.
    const { uid, ...profile } = user;
    const userRef = db.collection("users").doc(uid);

    // B5: every document has createdAt and updatedAt.
    // createdAt is set only the first time; updatedAt changes on every run.
    const existing = await userRef.get();
    const timestamps = existing.exists
      ? { updatedAt: FieldValue.serverTimestamp() }
      : {
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp()
        };

    await userRef.set(
      {
        ...profile,
        status: "active",
        ...timestamps
      },
      { merge: true }
    );
  }

  console.log("Success! Four emulator login accounts are ready.");
}

seedAuth()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
