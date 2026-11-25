import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes.js";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
  })
);

app.use(express.json());

app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "PCI Colombo API is running",
    data: null,
  });
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Backend is working correctly",
    data: null,
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`PCI Colombo server running on port ${PORT}`);
});