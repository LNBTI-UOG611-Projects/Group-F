const fs = require("fs");
const path = require("path");

const { initializeApp, getApps } =
  require("firebase-admin/app");

const { getFirestore } =
  require("firebase-admin/firestore");

// Only allow this script to run against the local emulator.
if (process.env.FIRESTORE_EMULATOR_HOST !== "127.0.0.1:8080") {
  console.error("STOP: Firestore Emulator is not configured.");
  process.exit(1);
}

// Read the project ID from Firebase configuration.
const configPath = path.resolve(__dirname, "../../.firebaserc");
const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
const projectId = config.projects.default;

if (!projectId) {
  throw new Error("Firebase project ID is missing.");
}

const app = getApps().length
  ? getApps()[0]
  : initializeApp({ projectId });

const db = getFirestore(app);

async function seedPhase2() {
  const records = [
    // Application roles
    ["roles", "main_admin", {
      name: "Main Admin",
      status: "active"
    }],
    ["roles", "sub_admin", {
      name: "Sub Admin",
      status: "active"
    }],
    ["roles", "customer", {
      name: "Customer",
      status: "active"
    }],
    ["roles", "employee", {
      name: "Employee",
      status: "active"
    }],

    // Five pest categories
    ["pestCategories", "rats", {
      name: "Rats",
      status: "active"
    }],
    ["pestCategories", "cockroaches", {
      name: "Cockroaches",
      status: "active"
    }],
    ["pestCategories", "termites", {
      name: "Subterranean Termites",
      status: "active"
    }],
    ["pestCategories", "mosquitoes", {
      name: "Mosquitoes",
      status: "active"
    }],
    ["pestCategories", "bedbugs", {
      name: "Bed Bugs",
      status: "active"
    }],

    // Fictional inventory
    ["inventoryItems", "demo-equipment-002", {
      itemName: "Inspection Torch",
      itemType: "equipment",
      availableQuantity: 6,
      unit: "units",
      status: "active"
    }],
    ["inventoryItems", "demo-equipment-003", {
      itemName: "Protective Gloves",
      itemType: "equipment",
      availableQuantity: 20,
      unit: "pairs",
      status: "active"
    }],

    // Example employee leave request
    ["leaveRequests", "demo-leave-001", {
      employeeId: "demo-employee",
      leaveType: "one_day",
      startDate: "2026-11-18",
      endDate: "2026-11-18",
      reason: "Fictional personal leave",
      status: "pending"
    }],

    // Initial stock record (illustrative audit entry)
    ["stockMovements", "demo-stock-001", {
      inventoryItemId: "demo-equipment-002",
      movementType: "opening_balance",
      quantity: 6,
      notes: "Initial fictional stock",
      status: "recorded"
    }]
  ];

  const batch = db.batch();

  for (const [collection, id, data] of records) {
    batch.set(db.collection(collection).doc(id), data);
  }

  await batch.commit();

  console.log(
    `Success! ${records.length} Phase 2 documents created.`
  );
}

seedPhase2()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
