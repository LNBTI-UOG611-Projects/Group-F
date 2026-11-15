
import "dotenv/config";
import { auth, db } from "../config/firebaseAdmin.js";

// Step 1: Verify the Firebase ID token
export async function verifyToken(req, res, next) {
  const authorization = req.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Authentication token is required",
    });
  }

  const token = authorization.slice(7).trim();

  if (!token) {
    return res.status(401).json({
      message: "Authentication token is required",
    });
  }

  try {
    const decodedToken = await auth.verifyIdToken(token);

    // Find the user profile in Firestore
    const userDoc = await db
      .collection("users")
      .doc(decodedToken.uid)
      .get();

    if (!userDoc.exists) {
      return res.status(403).json({
        message: "User profile not found",
      });
    }

    const profile = userDoc.data();

    if (profile.status !== "active") {
      return res.status(403).json({
        message: "User account is not active",
      });
    }

    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      role: profile.role,
    };

    next();
  } catch (error) {
    if (
      error.code?.startsWith("auth/") ||
      error.code === "auth/argument-error"
    ) {
      return res.status(401).json({
        message: "Invalid or expired authentication token",
      });
    }

    console.error("Authentication error:", error.message);

    return res.status(503).json({
      message: "Authentication service unavailable",
    });
  }
}

// Step 2: Authorize users based on their roles
export function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Access denied. Insufficient permissions.",
      });
    }

    next();
  };
}
