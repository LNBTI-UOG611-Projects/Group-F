
import { Router } from "express";
import {
  verifyToken,
  authorizeRoles,
} from "../middleware/auth.js";

const router = Router();

// Available to any active authenticated user
router.get("/me", verifyToken, (req, res) => {
  res.json({
    message: "Authentication successful",
    user: req.user,
  });
});

// Available only to Sub Admin users
router.get(
  "/sub-admin-test",
  verifyToken,
  authorizeRoles("sub_admin"),
  (req, res) => {
    res.json({
      message: "Welcome to the Sub Admin API",
      user: req.user,
    });
  }
);

export default router;
