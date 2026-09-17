import express from "express";
import authMiddleware, { requireRole } from "../middleware/authMiddleware.js";
import {
  addSalary,
  getSalary,
  getSalaryCollections,
  getSalariesByPayDate,
  updateSalaryByPayDate,
  deleteSalariesByPayDate,
} from "../controllers/salaryController.js";

const router = express.Router();

router.use(authMiddleware);
router.post("/add", requireRole("admin"), addSalary);
router.get("/employee/:id", getSalary);
router.put("/update/:payDate", requireRole("admin"), updateSalaryByPayDate);
router.get("/salaryCollections", requireRole("admin"), getSalaryCollections);
router.get("/collection/:payDate", requireRole("admin"), getSalariesByPayDate);
router.delete("/delete/:payDate", requireRole("admin"), deleteSalariesByPayDate);

export default router;
