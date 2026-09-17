import Employee from "../models/Employee.js";

export const isAdmin = (req) => req.user?.role === "admin";

export const isSelf = (req, userId) =>
  Boolean(userId) && String(req.user?._id) === String(userId);

export const forbidden = (res, message = "Forbidden") =>
  res.status(403).json({ success: false, error: message });

export const getOwnEmployee = async (req) =>
  Employee.findOne({ userId: req.user._id });

export const assertEmployeeOwner = async (req, res, employeeId) => {
  if (isAdmin(req)) return true;
  const employee = await getOwnEmployee(req);
  if (!employee || String(employee._id) !== String(employeeId)) {
    forbidden(res, "You can only access your own records");
    return false;
  }
  return true;
};
