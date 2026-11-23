const fs = require("fs");
const path = require("path");

const { initializeApp } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");

// Safety check: this script must NEVER write to live Firestore.
if (process.env.FIRESTORE_EMULATOR_HOST !== "127.0.0.1:8080") {
  console.error("STOP: Firestore Emulator is not configured.");
  process.exit(1);
}

// Use the Firebase project ID from the repository configuration.
const configPath = path.resolve(__dirname, "../../.firebaserc");
const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
const projectId = config.projects.default;

if (!projectId) {
  throw new Error("Firebase project ID not found in .firebaserc");
}

const app = initializeApp({ projectId });
const db = getFirestore(app);

// B5: every document has createdAt and updatedAt (server timestamps).
const timestamps = () => ({
  createdAt: FieldValue.serverTimestamp(),
  updatedAt: FieldValue.serverTimestamp()
});

async function seedDatabase() {
  // Users are created by seed-auth.cjs. Pest categories and inventory
  // are created by seed-phase2.cjs. All data below is fictional.
  const records = [
    ["customers", "demo-customer", {
      userUid: "demo-customer-user",
      customerType: "organization",
      displayName: "Example Customer",
      organizationName: "Example Office (Fictional)",
      contactPerson: "Demo Site Contact",
      phone: "0000000000",
      status: "active"
    }],
    ["employees", "demo-employee", {
      userUid: "demo-employee-user",
      employeeCode: "EMP-DEMO-001",
      fullName: "Example Employee",
      specializations: ["cockroaches"],
      status: "active"
    }],
    ["serviceLocations", "demo-location", {
      customerId: "demo-customer",
      name: "Example Office",
      addressLine1: "Fictional Test Address",
      city: "Colombo",
      contactPerson: "Demo Site Contact",
      contactNumber: "0000000000",
      notes: "Fictional location for testing",
      status: "active"
    }],
    ["serviceCategories", "demo-treatment", {
      name: "Pest control service",
      description: "Fictional service category",
      status: "active"
    }],
    ["serviceRequests", "demo-request", {
      customerId: "demo-customer",
      locationId: "demo-location",
      serviceCategoryId: "demo-treatment",
      pestCategoryIds: ["cockroaches"],
      description: "Fictional test request",
      priority: "normal",
      status: "submitted"
    }]
  ];

  const batch = db.batch();

  for (const [collection, id, data] of records) {
    // set() without merge replaces the whole document, so old wrong
    // field names (e.g. locationName, isActive) are removed on every run.
    batch.set(db.collection(collection).doc(id), { ...data, ...timestamps() });
  }

  await batch.commit();
  console.log(`Success! ${records.length} fictional Firestore documents created.`);
}

seedDatabase()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });