import Salary from "../models/Salary.js";
import Employee from "../models/Employee.js";
import dayjs from 'dayjs';

//Day js plugin
import utc from 'dayjs/plugin/utc.js';
dayjs.extend(utc);

const addSalary = async (req, res) => {
  try {
    let salaries = req.body.salaries || [req.body]; // support single or multiple

    if (!Array.isArray(salaries)) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid salary data" });
    }

    const salaryDocs = await Promise.all(
      salaries.map(async (salary) => {
        const {
          employeeId,
          kumoCareAllowance = 0,
          overtime = 0,
          birthdayBonus = 0,
          yearEndBonus = 0,
          advanceSalary = 0,
          homageDeduction = 0,
          absentDeduction = 0,
          payDate,
        } = salary;

        const normalizedPayDate = dayjs.utc(payDate).startOf('day').toDate();

        // Fetch employee.salary (basic)
        const employee = await Employee.findById(employeeId);
        if (!employee || employee.salary == null) {
          throw new Error(`Missing salary for employee ${employeeId}`);
        }
        const basicSalary = employee.salary;

        const revenueTotal =
          parseFloat(basicSalary || 0) +
          parseFloat(kumoCareAllowance || 0) +
          parseFloat(overtime || 0) +
          parseFloat(birthdayBonus || 0) +
          parseFloat(yearEndBonus || 0);

        const deductionTotal =
          parseFloat(advanceSalary || 0) +
          parseFloat(homageDeduction || 0) +
          parseFloat(absentDeduction || 0);

        const netSalary = revenueTotal - deductionTotal;

        return {
          basicSalary,
          employeeId,
          kumoCareAllowance,
          overtime,
          birthdayBonus,
          yearEndBonus,
          revenueTotal,
          advanceSalary,
          homageDeduction,
          absentDeduction,
          deductionTotal,
          netSalary,
          payDate: normalizedPayDate,
        };
      })
    );

    const payDateToSave = salaryDocs[0]?.payDate;
    if (payDateToSave) {
      const startOfDay = new Date(payDateToSave);
      startOfDay.setUTCHours(0, 0, 0, 0);
      const endOfDay = new Date(payDateToSave);
      endOfDay.setUTCHours(23, 59, 59, 999);

      const alreadyExists = await Salary.exists({
        payDate: { $gte: startOfDay, $lte: endOfDay },
      });

      if (alreadyExists) {
        return res.status(400).json({
          success: false,
          error:
            "Salary for this pay date already exists. Please edit the existing record.",
        });
      }
    }

    await Salary.insertMany(salaryDocs);
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, error: "Server error on Salary Add" });
  }
};

const updateSalaryByPayDate = async (req, res) => {
  try {
    const { salaries } = req.body;
    const { payDate } = req.params;

    const startOfDay = new Date(payDate);
    startOfDay.setUTCHours(0, 0, 0, 0);

    const endOfDay = new Date(payDate);
    endOfDay.setUTCHours(23, 59, 59, 999);

    if (!Array.isArray(salaries) || salaries.length === 0) {
      return res
        .status(400)
        .json({ success: false, error: "Salaries data is missing or invalid" });
    }

    const updatedSalaries = [];

    for (const salaryData of salaries) {
      const {
        employeeId,
        kumoCareAllowance = 0,
        overtime = 0,
        birthdayBonus = 0,
        yearEndBonus = 0,
        advanceSalary = 0,
        homageDeduction = 0,
        absentDeduction = 0,
      } = salaryData;

      if (!employeeId) continue;

      const employee = await Employee.findById(employeeId);
      if (!employee || employee.salary == null) {
        continue; // Skip this record if no base salary
      }

      const basicSalary = employee.salary;

      const revenueTotal =
        parseFloat(basicSalary || 0) +
        parseFloat(kumoCareAllowance) +
        parseFloat(overtime) +
        parseFloat(birthdayBonus) +
        parseFloat(yearEndBonus);

      const deductionTotal =
        parseFloat(advanceSalary) +
        parseFloat(homageDeduction) +
        parseFloat(absentDeduction);

      const netSalary = revenueTotal - deductionTotal;

      const updatedDoc = await Salary.findOneAndUpdate(
        { employeeId, payDate: { $gte: startOfDay, $lte: endOfDay } },
        {
          employeeId,
          basicSalary,
          kumoCareAllowance,
          overtime,
          birthdayBonus,
          yearEndBonus,
          revenueTotal,
          advanceSalary,
          homageDeduction,
          absentDeduction,
          deductionTotal,
          netSalary,
          payDate: new Date(payDate),
        },
        { new: true, upsert: true }
      );

      updatedSalaries.push(updatedDoc);
    }

    return res.status(200).json({ success: true, data: updatedSalaries });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      error: "Server error during salary update",
    });
  }
};

const getSalary = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.role !== "admin") {
      const ownEmployee = await Employee.findOne({ userId: req.user._id });
      const allowed =
        String(req.user._id) === String(id) ||
        (ownEmployee && String(ownEmployee._id) === String(id));
      if (!allowed) {
        return res.status(403).json({
          success: false,
          error: "You can only view your own salary",
        });
      }
    }

    let salary = [];
    salary = await Salary.find({ employeeId: id }).populate({
      path: "employeeId",
      populate: [
        { path: "department", select: "dep_name" },
        { path: "departments", select: "dep_name" },
        { path: "userId", select: "name" },
      ],
    });
    if (!salary || salary.length < 1) {
      const employee = await Employee.findOne({ userId: id });
      if (employee) {
        salary = await Salary.find({ employeeId: employee._id }).populate({
          path: "employeeId",
          populate: [
            { path: "department", select: "dep_name" },
            { path: "departments", select: "dep_name" },
            { path: "userId", select: "name" },
          ],
        });
      }
    }
    return res.status(200).json({ success: true, salary });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: "get salaries server error" });
  }
};

const getSalaryCollections = async (req, res) => {
  try {
    const salaryCollections = await Salary.aggregate([
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$payDate", timezone: "UTC" },
          },
          totalEmployees: { $sum: 1 },
          totalNetSalary: { $sum: "$netSalary" },
        },
      },
      {
        $sort: { _id: -1 },
      },
    ]);

    return res.status(200).json({ success: true, salaryCollections });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, error: "get salary collections server error" });
  }
};

const getSalariesByPayDate = async (req, res) => {
  try {
    const { payDate } = req.params;
     const startDate = new Date(payDate);
    startDate.setUTCHours(0, 0, 0, 0);

    const endDate = new Date(payDate);
    endDate.setUTCHours(23, 59, 59, 999);

    const salaries = await Salary.find({
      payDate: {
        $gte: startDate,
        $lte: endDate,
      },
    }).populate({
      path: "employeeId",
      populate: [
        { path: "department", select: "dep_name" },
        { path: "departments", select: "dep_name" },
        { path: "userId", select: "name" },
      ],
    });

    return res.status(200).json({ success: true, salaries });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Server error" });
  }
};

const deleteSalariesByPayDate = async (req, res) => {
  try {
    const { payDate } = req.params;

    const startDate = new Date(payDate);
    startDate.setUTCHours(0, 0, 0, 0);

    const endDate = new Date(payDate);
    endDate.setUTCHours(23, 59, 59, 999);

    const result = await Salary.deleteMany({
      payDate: {
        $gte: startDate,
        $lte: endDate,
      },
    });

    return res.status(200).json({
      success: true,
      message: `${result.deletedCount} salary records deleted for ${payDate}.`,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      error: "Delete Salary by Pay Date Server error",
    });
  }
};

export {
  addSalary,
  getSalary,
  updateSalaryByPayDate,
  getSalaryCollections,
  getSalariesByPayDate,
  deleteSalariesByPayDate
};
