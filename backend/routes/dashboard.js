import express from "express";
import authMiddleware, { requireRole } from "../middleware/authMiddleware.js";
import { getSummary, getEmployeeSummary } from "../controllers/dashboardController.js";

const router = express.Router();

router.get("/summary", authMiddleware, requireRole("admin"), getSummary);
router.get("/employee-summary", authMiddleware, requireRole("employee"), getEmployeeSummary);

export default router;
