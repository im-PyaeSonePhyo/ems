import Employee from "../models/Employee.js";
import User from "../models/User.js";
import Phone from "../models/Phone.js";
import bcrypt from "bcrypt";
import multer from "multer";
import path from "path";
import fs from "fs";
import { parseIdList } from "../utils/parseIds.js";
import { uploadsDir } from "../utils/paths.js";
import { isAdmin, isSelf, forbidden } from "../utils/access.js";
import { isStrongPassword, PASSWORD_HINT } from "../utils/password.js";

const IMAGE_EXTENSIONS = /\.(jpe?g|png|gif|webp|bmp)$/i;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const isImageUpload = (file) => {
  const extOk = IMAGE_EXTENSIONS.test(file.originalname || "");
  const mime = file.mimetype || "";
  const mimeOk = !mime || mime.startsWith("image/");
  return extOk && mimeOk;
};

const removeUploadedFile = (file) => {
  if (!file?.path) return;
  try {
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
  } catch {
    // Ignore cleanup failures for rejected uploads
  }
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (isImageUpload(file)) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

const uploadImage = (req, res, next) => {
  upload.single("image")(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        error: err.message || "Only image files are allowed",
      });
    }
    next();
  });
};

const validateEmailFormat = (email) => EMAIL_REGEX.test(String(email || "").trim());

const deleteStoredProfileImage = (filename) => {
  if (!filename) return;
  const imagePath = path.join(uploadsDir, filename);
  if (fs.existsSync(imagePath)) {
    fs.unlinkSync(imagePath);
  }
};

const canUpdateOwnProfileImage = (reqUser, targetUser) =>
  reqUser?.role === "employee" &&
  targetUser?._id &&
  String(reqUser._id) === String(targetUser._id);

const addEmployee = async (req, res) => {
  try {
    if (req.user?.role !== "admin") {
      removeUploadedFile(req.file);
      return res.status(403).json({
        success: false,
        error: "Only admins can create employees",
      });
    }

    let {
      name,
      email,
      nrc,
      current_address,
      permanent_address,
      workStartDay,
      employeeId,
      dob,
      gender,
      maritalStatus,
      designation,
      department,
      departments,
      salary,
      annualLeave,
      casualLeave,
      medicalLeave,
      maternityLeave,
      employeeType,
      duration,
      password,
      phones // Array of phone objects: [{type, number, note}]
    } = req.body;
    // Parse phones if sent as JSON string (FormData)
    if (typeof phones === 'string') {
      try {
        phones = JSON.parse(phones);
      } catch (e) {
        phones = [];
      }
    }

    const departmentIds = parseIdList(departments).length
      ? parseIdList(departments)
      : parseIdList(department);

    if (!departmentIds.length) {
      removeUploadedFile(req.file);
      return res.status(400).json({
        success: false,
        error: "Please select at least one department",
      });
    }

    if (!validateEmailFormat(email)) {
      removeUploadedFile(req.file);
      return res
        .status(400)
        .json({ success: false, error: "Please enter a valid email address" });
    }

    const user = await User.findOne({ email: String(email).trim() });
    if (user) {
      removeUploadedFile(req.file);
      return res
        .status(400)
        .json({ success: false, error: "This email is already registered" });
    }

    const startDuration = new Date();
    let endDuration;
    const durationType = Number(duration);

    if (durationType === 0) {
      endDuration = new Date(startDuration);
      endDuration.setFullYear(endDuration.getFullYear() + 10);
    } else {
      endDuration = new Date(
        startDuration.getFullYear(),
        startDuration.getMonth() + Number(duration),
        startDuration.getDate()
      );
    }

    if (!isStrongPassword(password)) {
      removeUploadedFile(req.file);
      return res.status(400).json({
        error: PASSWORD_HINT,
      });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      nrc,
      current_address,
      permanent_address,
      password: hashPassword,
      role: "employee",
      profileImage: req.file ? req.file.filename : "",
    });
    const savedUser = await newUser.save();

    // Save phones
    if (Array.isArray(phones)) {
      for (const phone of phones) {
        if (phone.number && phone.type) {
          await Phone.create({
            userId: savedUser._id,
            type: phone.type,
            number: phone.number,
            note: phone.note || ""
          });
        }
      }
    }

    const newEmployee = new Employee({
      userId: savedUser._id,
      employeeId,
      dob,
      gender,
      maritalStatus,
      designation,
      department: departmentIds[0],
      departments: departmentIds,
      salary,
      annualLeave,
      casualLeave,
      medicalLeave,
      maternityLeave,
      employeeType,
      duration,
      startDuration,
      endDuration,
      workStartDay,
    });

    await newEmployee.save();
    return res.status(200).json({ success: true, message: "employee created" });
  } catch (error) {
    console.log(error);
    removeUploadedFile(req.file);
    return res
      .status(500)
      .json({ success: false, error: "server error in adding employee" });
  }
};

const getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find()
      .populate("userId", { password: 0 })
      .populate("department")
      .populate("departments");
    return res.status(200).json({ success: true, employees });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: "get employees server error" });
  }
};

const getEmployee = async (req, res) => {
  const { id } = req.params;
  try {
    let employee;
    employee = await Employee.findById({ _id: id })
      .populate("userId", { password: 0 })
      .populate("department")
      .populate("departments");
    if (!employee) {
      employee = await Employee.findOne({ userId: id })
        .populate("userId", { password: 0 })
        .populate("department")
        .populate("departments");
    }
    if (!employee) {
      return res.status(404).json({ success: false, error: "employee not found" });
    }
    if (
      !isAdmin(req) &&
      !isSelf(req, employee.userId?._id || employee.userId)
    ) {
      return forbidden(res, "You can only view your own profile");
    }
    return res.status(200).json({ success: true, employee });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: "get employees server error" });
  }
};

const updateEmployee = async (req, res) => {
  const { id } = req.params;

  try {
    let {
      name,
      email,
      nrc,
      current_address,
      permanent_address,
      workStartDay,
      maritalStatus,
      dob,
      gender,
      designation,
      department,
      departments,
      salary,
      annualLeave,
      casualLeave,
      medicalLeave,
      maternityLeave,
      employeeType,
      duration,
      phones // Array of phone objects: [{_id, type, number, note}]
    } = req.body;
    // Parse phones if sent as JSON string (FormData)
    if (typeof phones === 'string') {
      try {
        phones = JSON.parse(phones);
      } catch (e) {
        phones = [];
      }
    }

    const departmentIds = parseIdList(departments).length
      ? parseIdList(departments)
      : parseIdList(department);

    if (!departmentIds.length) {
      removeUploadedFile(req.file);
      return res.status(400).json({
        success: false,
        error: "Please select at least one department",
      });
    }

    const employee = await Employee.findById({ _id: id });
    if (!employee) {
      removeUploadedFile(req.file);
      return res
        .status(404)
        .json({ success: false, error: "employee not found" });
    }

    const user = await User.findById({ _id: employee.userId });
    if (!user) {
      removeUploadedFile(req.file);
      return res.status(404).json({ success: false, error: "user not found" });
    }

    if (email && !validateEmailFormat(email)) {
      removeUploadedFile(req.file);
      return res
        .status(400)
        .json({ success: false, error: "Please enter a valid email address" });
    }

    if (email) {
      const existingUser = await User.findOne({
        email: email.trim(),
        _id: { $ne: user._id },
      });
      if (existingUser) {
        removeUploadedFile(req.file);
        return res.status(400).json({
          success: false,
          error: "This email is already registered",
        });
      }
    }

    const updatedUserData = { name, email, nrc, current_address, permanent_address };
    if (req.file) {
      if (canUpdateOwnProfileImage(req.user, user)) {
        deleteStoredProfileImage(user.profileImage);
        updatedUserData.profileImage = req.file.filename;
      } else {
        removeUploadedFile(req.file);
      }
    }

    const updatedAt = new Date();
    const startDuration = new Date();
    let endDuration;
    if (Number(duration) === 0) {
      endDuration = new Date(startDuration);
      endDuration.setFullYear(endDuration.getFullYear() + 10);
    } else {
      endDuration = new Date(
        startDuration.getFullYear(),
        startDuration.getMonth() + Number(duration),
        startDuration.getDate()
      );
    }

    await User.findByIdAndUpdate(employee.userId, updatedUserData);

    // Sync phones
    if (Array.isArray(phones)) {
      // Get existing phones
      const existingPhones = await Phone.find({ userId: employee.userId });
      const incomingIds = phones.filter(p => p._id).map(p => p._id);
      // Delete removed phones
      for (const phone of existingPhones) {
        if (!incomingIds.includes(phone._id.toString())) {
          await Phone.findByIdAndDelete(phone._id);
        }
      }
      // Add or update phones
      for (const phone of phones) {
        if (phone._id) {
          // Update
          await Phone.findByIdAndUpdate(phone._id, {
            type: phone.type,
            number: phone.number,
            note: phone.note || ""
          });
        } else if (phone.number && phone.type) {
          // Add new
          await Phone.create({
            userId: employee.userId,
            type: phone.type,
            number: phone.number,
            note: phone.note || ""
          });
        }
      }
    }

    await Employee.findByIdAndUpdate(id, {
      maritalStatus,
      designation,
      salary,
      department: departmentIds[0],
      departments: departmentIds,
      dob,
      gender,
      annualLeave,
      casualLeave,
      medicalLeave,
      maternityLeave,
      employeeType,
      duration,
      startDuration,
      endDuration,
      workStartDay,
      updatedAt,
    });

    return res.status(200).json({ success: true, message: "employee updated" });
  } catch (error) {
    console.log(error);
    removeUploadedFile(req.file);
    return res
      .status(500)
      .json({ success: false, error: "update employees server error" });
  }
};

const updateProfileImage = async (req, res) => {
  try {
    if (req.user?.role !== "employee") {
      removeUploadedFile(req.file);
      return res.status(403).json({
        success: false,
        error: "Admins cannot update profile photos",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "Please choose an image",
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      removeUploadedFile(req.file);
      return res.status(404).json({ success: false, error: "user not found" });
    }

    deleteStoredProfileImage(user.profileImage);
    user.profileImage = req.file.filename;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile photo updated",
      profileImage: user.profileImage,
    });
  } catch (error) {
    removeUploadedFile(req.file);
    return res.status(500).json({
      success: false,
      error: "Failed to update profile photo",
    });
  }
};

const fetchEmployeesByDepId = async (req, res) => {
  const { id } = req.params;
  try {
    const employees = await Employee.find({
      $or: [{ department: id }, { departments: id }],
    });
    return res.status(200).json({ success: true, employees });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: "get employeesbyDepId server error" });
  }
};

const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    const employee = await Employee.findById({ _id: id });

    if (!employee) {
      return res.status(404).json({
        success: false,
        error: "Employee not found.",
      });
    }

    // Delete all phones for this user
    await Phone.deleteMany({ userId: employee.userId });

    await employee.deleteOne(); // This triggers the pre("deleteOne") hook

    return res.status(200).json({
      success: true,
      message: "Employee deleted successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Server error while deleting employee.",
    });
  }
};

export {
  addEmployee,
  upload,
  uploadImage,
  getEmployees,
  getEmployee,
  updateEmployee,
  updateProfileImage,
  fetchEmployeesByDepId,
  deleteEmployee,
};
