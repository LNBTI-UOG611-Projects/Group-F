
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

  return router;
}

module.exports = { createInventoryRouter };
