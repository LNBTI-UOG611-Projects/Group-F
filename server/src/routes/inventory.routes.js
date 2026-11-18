
const express = require("express");
const { createInventoryService } = require("../services/inventory.service");

// Shared backend supplies its Firestore connection and
// authentication/authorization middleware.
function createInventoryRouter({ db, authenticate, requireMainAdmin }) {
  const router = express.Router();
  const inventory = createInventoryService(db);

  // Every inventory request requires authentication
  // and the Main Admin role.
  router.use(authenticate);
  router.use(requireMainAdmin);

  // GET /api/inventory
  router.get("/", async (req, res) => {
    try {
      const items = await inventory.getAllItems();

      res.status(200).json({
        success: true,
        data: items,
      });
    } catch (error) {
      console.error("Inventory read error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve inventory",
      });
    }
  });

  // POST /api/inventory
  router.post("/", async (req, res) => {
    try {
      const item = await inventory.addItem(req.body);

      res.status(201).json({
        success: true,
        message: "Inventory item created",
        data: item,
      });
    } catch (error) {
      // Validation errors; unexpected failures are 500.
      const validationErrors = [
        "Valid item name is required",
        "Invalid inventory item type",
        "Invalid SKU",
        "Valid unit is required",
        "Reorder level must be nonnegative",
        "Invalid pest categories",
        "Unknown or inactive pest category",
      ];

      if (validationErrors.includes(error.message)) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      console.error("Inventory creation error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to create inventory item",
      });
    }
  });

  // PATCH /api/inventory/:itemId
  router.patch("/:itemId", async (req, res) => {
    try {
      const updatedItem = await inventory.updateItem(
        req.params.itemId,
        req.body
      );

      return res.status(200).json({
        success: true,
        message: "Inventory item updated",
        data: updatedItem
      });

    } catch (error) {
      const messages = [
        "Invalid inventory item ID",
        "Invalid update data",
        "Invalid update fields",
        "Invalid item name",
        "Invalid reorder level",
        "Invalid pest categories",
        "Unknown pest category",
        "Inventory item not found",
        "Cannot edit archived item"
      ];

      if (messages.includes(error.message)) {
        const status =
          error.message === "Inventory item not found"
            ? 404
            : error.message === "Cannot edit archived item"
              ? 409
              : 400;

        return res.status(status).json({
          success: false,
          message: error.message
        });
      }

      console.error("Inventory update error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to update inventory item"
      });
    }
  });

  // PATCH /api/inventory/:itemId/archive
  router.patch("/:itemId/archive", async (req, res) => {
    try {
      const result = await inventory.archiveItem(
        req.params.itemId
      );

      return res.status(200).json({
        success: true,
        data: result
      });

    } catch (error) {
      const statusMap = {
        "Invalid inventory item ID": 400,
        "Inventory item not found": 404,
        "Item already archived": 409,
        "Cannot archive item with reserved stock": 409
      };

      if (Object.prototype.hasOwnProperty.call(
        statusMap, error.message
      )) {
        return res.status(statusMap[error.message]).json({
          success: false,
          message: error.message
        });
      }

      console.error("Inventory archive error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to archive inventory item"
      });
    }
  });

  return router;
}

module.exports = { createInventoryRouter };
