import express from "express";
import authMiddleware, { requireRole } from "../middleware/authMiddleware.js";
import {
  addDepartment,
  getDepartments,
  getDepartment,
  updateDepartment,
  deleteDepartment,
} from "../controllers/departmentController.js";

const router = express.Router();

router.use(authMiddleware, requireRole("admin"));
router.get("/", getDepartments);
router.post("/add", addDepartment);
router.get("/:id", getDepartment);
router.put("/:id", updateDepartment);
router.delete("/:id", deleteDepartment);

export default router;
