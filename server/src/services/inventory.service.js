
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

  // UPDATE: Edit an existing inventory item's details
  async function updateItem(itemId, input) {
    if (!itemId || typeof itemId !== "string") {
      throw new Error("Invalid inventory item ID");
    }

    if (!input || typeof input !== "object" ||
        Array.isArray(input)) {
      throw new Error("Invalid update data");
    }

    // Only allow these fields to be edited here.
    const allowedFields = [
      "name",
      "reorderLevel",
      "pestCategoryIds"
    ];

    const keys = Object.keys(input);

    if (
      keys.length === 0 ||
      keys.some((key) => !allowedFields.includes(key))
    ) {
      throw new Error("Invalid update fields");
    }

    const changes = {};

    if ("name" in input) {
      if (
        typeof input.name !== "string" ||
        !input.name.trim() ||
        input.name.trim().length > 150
      ) {
        throw new Error("Invalid item name");
      }

      changes.name = input.name.trim();
    }

    if ("reorderLevel" in input) {
      if (
        typeof input.reorderLevel !== "number" ||
        !Number.isFinite(input.reorderLevel) ||
        input.reorderLevel < 0
      ) {
        throw new Error("Invalid reorder level");
      }

      changes.reorderLevel = input.reorderLevel;
    }

    if ("pestCategoryIds" in input) {
      if (
        !Array.isArray(input.pestCategoryIds) ||
        !input.pestCategoryIds.every(
          (id) =>
            typeof id === "string" &&
            id.length > 0
        )
      ) {
        throw new Error("Invalid pest categories");
      }

      const categories = [
        ...new Set(input.pestCategoryIds)
      ];

      for (const categoryId of categories) {
        const categoryDoc = await db
          .collection("pestCategories")
          .doc(categoryId)
          .get();

        if (
          !categoryDoc.exists ||
          categoryDoc.data().active !== true
        ) {
          throw new Error("Unknown pest category");
        }
      }

      changes.pestCategoryIds = categories;
    }

    const itemRef = db.collection(COLLECTION).doc(itemId);

    // A transaction prevents editing an item that is
    // archived while this update is taking place.
    await db.runTransaction(async (transaction) => {
      const existing = await transaction.get(itemRef);

      if (!existing.exists) {
        throw new Error("Inventory item not found");
      }

      if (existing.data().isActive !== true) {
        throw new Error("Cannot edit archived item");
      }

      transaction.update(itemRef, {
        ...changes,
        updatedAt: FieldValue.serverTimestamp(),
      });
    });

    const updated = await itemRef.get();

    return {
      id: updated.id,
      ...updated.data()
    };
  }

  // ARCHIVE: Mark an item as inactive
  async function archiveItem(itemId) {
    if (!itemId || typeof itemId !== "string") {
      throw new Error("Invalid inventory item ID");
    }

    const itemRef = db.collection(COLLECTION).doc(itemId);

    await db.runTransaction(async (transaction) => {
      const existing = await transaction.get(itemRef);

      if (!existing.exists) {
        throw new Error("Inventory item not found");
      }

      const item = existing.data();

      if (item.isActive !== true) {
        throw new Error("Item already archived");
      }

      if (
        typeof item.quantityReserved !== "number" ||
        item.quantityReserved > 0
      ) {
        throw new Error(
          "Cannot archive item with reserved stock"
        );
      }

      transaction.update(itemRef, {
        isActive: false,
        updatedAt: FieldValue.serverTimestamp()
      });
    });

    return {
      id: itemId,
      message: "Inventory item archived successfully"
    };
  }

  return {
    getAllItems,
    addItem,
    updateItem,
    archiveItem
  };
}

module.exports = { createInventoryService };
