import express from "express";
import fs from "fs";
import path from "path";
import authMiddleware from "../middleware/authMiddleware.js";
import { uploadsDir } from "../utils/paths.js";

const router = express.Router();

router.get("/:filename", authMiddleware, (req, res) => {
  const filename = path.basename(req.params.filename || "");
  if (!filename) {
    return res.status(400).json({ success: false, error: "Invalid file" });
  }

  if (req.user.role !== "admin" && req.user.profileImage !== filename) {
    return res.status(403).json({ success: false, error: "Forbidden" });
  }

  const filePath = path.join(uploadsDir, filename);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ success: false, error: "File not found" });
  }

  return res.sendFile(filePath);
});

export default router;
