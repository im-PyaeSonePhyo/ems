import express from "express";
import authMiddleware, { requireRole } from "../middleware/authMiddleware.js";
import {
  addLeave,
  getLeave,
  getLeaves,
  getLeaveDetails,
  updateLeaveStatus,
  updateLeave,
  deleteLeave,
} from "../controllers/leaveController.js";

const router = express.Router();

router.use(authMiddleware);
router.post("/add", requireRole("employee"), addLeave);
router.get("/details/:id", getLeaveDetails);
router.get("/", requireRole("admin"), getLeaves);
router.get("/:id", getLeave);
router.put("/details/:id", requireRole("admin"), updateLeaveStatus);
router.put("/:id", updateLeave);
router.delete("/:id", deleteLeave);

export default router;
