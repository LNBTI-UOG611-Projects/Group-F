
const { FieldValue } = require("firebase-admin/firestore");

const COLLECTION = "inventoryItems";
const ITEM_TYPES = ["chemical", "equipment", "other_consumable"];

function createInventoryService(db) {
  // READ: Retrieve inventory items from Firestore
  async function getAllItems() {
    const snapshot = await db.collection(COLLECTION).get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  }

  // CREATE: Add a new inventory item
  async function addItem(input) {
    const {
      name,
      itemType,
      sku,
      unit,
      reorderLevel,
      pestCategoryIds = [],
    } = input;

    if (
      typeof name !== "string" ||
      !name.trim() ||
      name.trim().length > 150
    ) {
      throw new Error("Valid item name is required");
    }

    if (!ITEM_TYPES.includes(itemType)) {
      throw new Error("Invalid inventory item type");
    }

    if (
      typeof sku !== "string" ||
      !/^[A-Za-z0-9_-]{2,40}$/.test(sku)
    ) {
      throw new Error("Invalid SKU");
    }

    if (
      typeof unit !== "string" ||
      !unit.trim() ||
      unit.trim().length > 30
    ) {
      throw new Error("Valid unit is required");
    }

    if (
      typeof reorderLevel !== "number" ||
      !Number.isFinite(reorderLevel) ||
      reorderLevel < 0
    ) {
      throw new Error("Reorder level must be nonnegative");
    }

    if (
      !Array.isArray(pestCategoryIds) ||
      !pestCategoryIds.every(
        (id) => typeof id === "string" && id.length > 0
      )
    ) {
      throw new Error("Invalid pest categories");
    }

    // Verify every selected pest category exists and is active.
    const uniqueCategories = [...new Set(pestCategoryIds)];

    for (const categoryId of uniqueCategories) {
      const categoryDoc = await db
        .collection("pestCategories")
        .doc(categoryId)
        .get();

      if (!categoryDoc.exists || categoryDoc.data().active !== true) {
        throw new Error("Unknown or inactive pest category");
      }
    }

    const item = {
      name: name.trim(),
      itemType,
      sku: sku.trim().toUpperCase(),
      unit: unit.trim(),
      quantityOnHand: 0,
      quantityReserved: 0,
      reorderLevel,
      pestCategoryIds: uniqueCategories,
      isActive: true,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    if (itemType === "chemical") {
      item.approvalStatus = "pending_review";
    }

    // A separate stock receipt will add the opening quantity.
    const docRef = await db.collection(COLLECTION).add(item);

    return {
      id: docRef.id,
      ...item,
    };
  }

  return { getAllItems, addItem };
}

module.exports = { createInventoryService };
