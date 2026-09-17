import express from "express";
import authMiddleware, { requireRole } from "../middleware/authMiddleware.js";
import {
  getEmployees,
  addEmployee,
  uploadImage,
  getEmployee,
  updateEmployee,
  updateProfileImage,
  fetchEmployeesByDepId,
  deleteEmployee,
} from "../controllers/employeeController.js";
import Phone from "../models/Phone.js";
import { forbidden, isAdmin, isSelf } from "../utils/access.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/:id/phones", async (req, res) => {
  try {
    if (!isAdmin(req) && !isSelf(req, req.params.id)) {
      return forbidden(res);
    }
    const phones = await Phone.find({ userId: req.params.id });
    res.json({ success: true, phones });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to fetch phones" });
  }
});

router.get("/phone/:phoneId", requireRole("admin"), async (req, res) => {
  try {
    const phone = await Phone.findById(req.params.phoneId);
    res.json({ success: true, phone });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to fetch phone" });
  }
});

router.get("/", requireRole("admin"), getEmployees);
router.post("/add", requireRole("admin"), uploadImage, addEmployee);
router.put("/profile-image", requireRole("employee"), uploadImage, updateProfileImage);
router.get("/department/:id", requireRole("admin"), fetchEmployeesByDepId);
router.get("/:id", getEmployee);
router.put("/:id", requireRole("admin"), uploadImage, updateEmployee);
router.delete("/:id", requireRole("admin"), deleteEmployee);

export default router;
