import moment from "moment";
import Department from "../models/Department.js";
import Employee from "../models/Employee.js";
import Leave from "../models/Leave.js";
import Salary from "../models/Salary.js";

const departmentLabel = (employee) => {
  const departments =
    Array.isArray(employee.departments) && employee.departments.length
      ? employee.departments
      : employee.department
      ? [employee.department]
      : [];

  const names = departments
    .map((dep) => dep?.dep_name)
    .filter(Boolean);

  return names.length ? names.join(", ") : "-";
};

const getSummary = async (req, res) => {
  try {
    const totalEmployees = await Employee.countDocuments();
    const totalDepartments = await Department.countDocuments();
    // const totalSalaries = await Employee.aggregate([
    //   { $group: { _id: null, totalSalary: { $sum: "$salary" } } },
    // ]);

    // const employeeAppliedForLeave = await Leave.distinct("employeeId");
    const employeeAppliedForLeave = await Leave.find();

    const leaveStatus = await Leave.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const leaveSummary = {
      appliedFor: employeeAppliedForLeave.length,
      approved:
        leaveStatus.find((item) => item._id === "Approved")?.count || 0,
      rejected:
        leaveStatus.find((item) => item._id === "Rejected")?.count || 0,
      pending:
        leaveStatus.find((item) => item._id === "Pending")?.count || 0,
    };
  
      const employeeList = await Employee.find();

      const currentDate = moment().startOf('day');

      const promoteEmployees = employeeList.filter((emp) => {
        const localDate = new Date(emp.endDuration);
        const utcDate = new Date(localDate.getTime() + localDate.getTimezoneOffset() * 60000);
        const endDate = moment(utcDate).startOf('day');

        return endDate.isSame(currentDate) || endDate.isBefore(currentDate);
      });

      const totalPromoteEmployees  = promoteEmployees?.length || 0;

    return res
      .status(200)
      .json({
        success: true,
        totalEmployees,
        totalDepartments,
        // totalSalary: totalSalaries[0]?.totalSalary || 0,
        leaveSummary,
        totalPromoteEmployees,
      });
  } catch (error) {
    return res.status(500).json({ success: false, error: "dashboard summary server error" });
  }
};

const getEmployeeSummary = async (req, res) => {
  try {
    const employee = await Employee.findOne({ userId: req.user._id })
      .populate("department")
      .populate("departments")
      .populate("userId", "name");

    if (!employee) {
      return res
        .status(404)
        .json({ success: false, error: "Employee not found" });
    }

    const leaves = await Leave.find({ employeeId: employee._id }).select(
      "status"
    );

    const leaveSummary = {
      appliedFor: leaves.length,
      approved: leaves.filter((leave) => leave.status === "Approved").length,
      pending: leaves.filter((leave) => leave.status === "Pending").length,
      rejected: leaves.filter((leave) => leave.status === "Rejected").length,
    };

    const latestSalary = await Salary.findOne({ employeeId: employee._id })
      .sort({ payDate: -1 })
      .select("netSalary payDate basicSalary");

    return res.status(200).json({
      success: true,
      employee: {
        name: employee.userId?.name || req.user.name,
        designation: employee.designation || "-",
        employeeType: employee.employeeType || "-",
        department: departmentLabel(employee),
        annualLeave: employee.annualLeave || 0,
        casualLeave: employee.casualLeave || 0,
        medicalLeave: employee.medicalLeave || 0,
        maternityLeave: employee.maternityLeave || 0,
      },
      leaveSummary,
      latestSalary: latestSalary
        ? {
            netSalary: latestSalary.netSalary,
            payDate: latestSalary.payDate,
            basicSalary: latestSalary.basicSalary,
          }
        : null,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: "employee dashboard summary server error" });
  }
};

export { getSummary, getEmployeeSummary };
