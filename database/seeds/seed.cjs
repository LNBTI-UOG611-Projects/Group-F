
const fs = require("fs");
const path = require("path");

const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

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

async function seedDatabase() {
  const records = [
    ["users", "demo-admin", {
      displayName: "Demo Main Admin",
      role: "main_admin",
      status: "active"
    }],
    ["customers", "demo-customer", {
      displayName: "Example Customer",
      contactNumber: "0000000000",
      status: "active"
    }],
    ["employees", "demo-employee", {
      displayName: "Example Employee",
      employeeNo: "EMP-DEMO-001",
      status: "active"
    }],
    ["serviceLocations", "demo-location", {
      customerId: "demo-customer",
      locationName: "Example Office",
      city: "Colombo",
      isActive: true
    }],
    ["serviceRequests", "demo-request", {
      customerId: "demo-customer",
      locationId: "demo-location",
      pestCategory: "cockroaches",
      description: "Fictional test request",
      status: "pending"
    }],
    ["inventoryItems", "demo-item", {
      itemName: "Demo Reusable Equipment",
      itemType: "equipment",
      availableQuantity: 5,
      unit: "units",
      status: "active"
    }]
  ];

  const batch = db.batch();

  for (const [collection, id, data] of records) {
    batch.set(db.collection(collection).doc(id), data);
  }

  await batch.commit();
  console.log("Success! Six fictional Firestore documents created.");
}

seedDatabase()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
