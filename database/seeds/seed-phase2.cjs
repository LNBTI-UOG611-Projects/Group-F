const fs = require("fs");
const path = require("path");

const { initializeApp } = require("firebase-admin/app");
const { getFirestore, FieldValue, Timestamp } = require("firebase-admin/firestore");

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

const app = initializeApp({ projectId });
const db = getFirestore(app);

// B5: every document has createdAt and updatedAt (server timestamps).
const timestamps = () => ({
  createdAt: FieldValue.serverTimestamp(),
  updatedAt: FieldValue.serverTimestamp()
});

// A calendar date in Sri Lanka time, stored as a Firestore timestamp.
const colomboDate = (isoDate) =>
  Timestamp.fromDate(new Date(`${isoDate}T00:00:00+05:30`));

async function seedPhase2() {
  const records = [
    // Application roles (reference list; users store one `role` string)
    ["roles", "main_admin", { name: "Main Admin", status: "active", ...timestamps() }],
    ["roles", "sub_admin", { name: "Sub Admin", status: "active", ...timestamps() }],
    ["roles", "customer", { name: "Customer", status: "active", ...timestamps() }],
    ["roles", "employee", { name: "Employee", status: "active", ...timestamps() }],

    // Five pest categories (IDs fixed by DECISIONS B7)
    ["pestCategories", "rats", { name: "Rats", status: "active", ...timestamps() }],
    ["pestCategories", "cockroaches", { name: "Cockroaches", status: "active", ...timestamps() }],
    ["pestCategories", "termites", { name: "Subterranean Termites", status: "active", ...timestamps() }],
    ["pestCategories", "mosquitoes", { name: "Mosquitoes", status: "active", ...timestamps() }],
    ["pestCategories", "bedbugs", { name: "Bed Bugs", status: "active", ...timestamps() }],

    // Fictional inventory (DECISIONS B7 field names)
    ["inventoryItems", "demo-equipment-002", {
      name: "Inspection Torch",
      itemType: "equipment",
      sku: "EQ-TORCH-001",
      unit: "units",
      quantityOnHand: 6,
      quantityReserved: 0,
      reorderLevel: 2,
      pestCategoryIds: [],
      status: "active",
      ...timestamps()
    }],
    ["inventoryItems", "demo-equipment-003", {
      name: "Protective Gloves",
      itemType: "equipment",
      sku: "EQ-GLOVE-001",
      unit: "pairs",
      quantityOnHand: 20,
      quantityReserved: 0,
      reorderLevel: 10,
      pestCategoryIds: [],
      status: "active",
      ...timestamps()
    }],
    ["inventoryItems", "demo-chemical-001", {
      name: "Demo Gel Bait (Fictional)",
      itemType: "chemical",
      sku: "CH-DEMO-001",
      unit: "grams",
      quantityOnHand: 0,
      quantityReserved: 0,
      reorderLevel: 100,
      pestCategoryIds: ["cockroaches"],
      status: "active",
      approvalStatus: "pending_review",
      ...timestamps()
    }],

    // Opening stock. quantityOnHand above must equal the sum of these
    // movements, because stock only changes through stockMovements (B7).
    // Movements are never edited, so they only have createdAt.
    ["stockMovements", "demo-stock-001", {
      inventoryItemId: "demo-equipment-002",
      movementType: "opening_balance",
      quantity: 6,
      notes: "Initial fictional stock",
      recordedByUid: "demo-admin",
      createdAt: FieldValue.serverTimestamp()
    }],
    ["stockMovements", "demo-stock-002", {
      inventoryItemId: "demo-equipment-003",
      movementType: "opening_balance",
      quantity: 20,
      notes: "Initial fictional stock",
      recordedByUid: "demo-admin",
      createdAt: FieldValue.serverTimestamp()
    }],

    // Example employee leave request
    ["leaveRequests", "demo-leave-001", {
      employeeId: "demo-employee",
      leaveType: "one_day",
      startDate: colomboDate("2026-11-18"),
      endDate: colomboDate("2026-11-18"),
      reason: "Fictional personal leave",
      status: "pending",
      ...timestamps()
    }]
  ];

  const batch = db.batch();

  for (const [collection, id, data] of records) {
    // set() without merge replaces the whole document, so old field
    // names (itemName, availableQuantity) are removed on every run.
    batch.set(db.collection(collection).doc(id), data);
  }

  await batch.commit();

  console.log(`Success! ${records.length} Phase 2 documents created.`);
}

seedPhase2()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });