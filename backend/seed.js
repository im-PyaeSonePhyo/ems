import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

import User from "./models/User.js";
import Department from "./models/Department.js";
import Employee from "./models/Employee.js";
import Phone from "./models/Phone.js";
import Leave from "./models/Leave.js";
import Salary from "./models/Salary.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, "public", "uploads");

const employeeImageName = (name) =>
  `${String(name).toLowerCase().trim().replace(/\s+/g, "-")}.jpg`;

const SEED_IMAGE_RENAMES = [
  ["1782975184444.jpg", "htet-aung.jpg"],
  ["1782975089164.jpg", "su-mon.jpg"],
  ["1782974924199.jpg", "zaw-lin.jpg"],
  ["1782975329767.jpg", "aye-chan.jpg"],
  ["1782975512882.jpg", "min-thu.jpg"],
  ["1782974818239.jpeg", "nwe-nwe.jpg"],
  ["1782975685652.jpg", "kyaw-zin.jpg"],
  ["1782975588421.jpg", "thida-win.jpg"],
  ["shanks-5k-one-piece-5120x2880-18352.jpg", "myo-naing.jpg"],
  ["1782975790564.jpg", "hnin-si.jpg"],
];

const prepareEmployeeImages = () => {
  fs.mkdirSync(uploadsDir, { recursive: true });
  for (const [from, to] of SEED_IMAGE_RENAMES) {
    const fromPath = path.join(uploadsDir, from);
    const toPath = path.join(uploadsDir, to);
    if (fs.existsSync(fromPath) && !fs.existsSync(toPath)) {
      fs.renameSync(fromPath, toPath);
    }
  }
};

const PERMANENT_LEAVES = {
  annualLeave: 12,
  casualLeave: 6,
  medicalLeave: 14,
};

const durationDates = (employeeType, duration, workStartDay) => {
  const startDuration = new Date(workStartDay);
  const endDuration = new Date(startDuration);

  if (employeeType === "Permanent" || Number(duration) === 0) {
    endDuration.setFullYear(endDuration.getFullYear() + 10);
  } else {
    endDuration.setMonth(endDuration.getMonth() + Number(duration));
  }

  return { startDuration, endDuration };
};

const leaveBalances = (employeeType, gender) => {
  if (employeeType !== "Permanent") {
    return {
      annualLeave: 0,
      casualLeave: 0,
      medicalLeave: 0,
      maternityLeave: 0,
    };
  }

  return {
    ...PERMANENT_LEAVES,
    maternityLeave: gender === "female" ? 90 : 14,
  };
};

const salaryTotals = ({
  basicSalary,
  kumoCareAllowance = 0,
  overtime = 0,
  birthdayBonus = 0,
  yearEndBonus = 0,
  advanceSalary = 0,
  homageDeduction = 0,
  absentDeduction = 0,
}) => {
  const revenueTotal =
    basicSalary +
    kumoCareAllowance +
    overtime +
    birthdayBonus +
    yearEndBonus;

  const deductionTotal = advanceSalary + homageDeduction + absentDeduction;

  return {
    revenueTotal,
    deductionTotal,
    netSalary: revenueTotal - deductionTotal,
  };
};

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("Connected to MongoDB");

    prepareEmployeeImages();

    await User.deleteMany({});
    await Department.deleteMany({});
    await Employee.deleteMany({});
    await Phone.deleteMany({});
    await Leave.deleteMany({});
    await Salary.deleteMany({});
    console.log("Cleared existing data");

    const hashedPassword = await bcrypt.hash("Admin@123", 10);

    const admin = await User.create({
      name: "Pyae Sone Phyo",
      email: "admin@ems.com",
      nrc: "12/TaMaNa(N)123456",
      current_address: "Yangon, Myanmar",
      permanent_address: "Yangon, Myanmar",
      password: hashedPassword,
      role: "admin",
    });

    console.log("Created admin user");

    const departments = await Department.insertMany([
      { dep_name: "Engineering", description: "Software development and IT infrastructure" },
      { dep_name: "Marketing", description: "Brand, campaigns, and growth" },
      { dep_name: "Human Resources", description: "People operations and recruitment" },
      { dep_name: "Finance", description: "Accounting and financial planning" },
      { dep_name: "Design", description: "UI/UX and graphic design" },
    ]);

    const departmentByName = Object.fromEntries(
      departments.map((dep) => [dep.dep_name, dep._id])
    );

    console.log("Created departments");

    const employeeRecords = [
      {
        name: "Htet Aung",
        email: "htet@ems.com",
        nrc: "12/BaHaNa(N)100001",
        current_address: "Yangon",
        permanent_address: "Bago",
        gender: "male",
        maritalStatus: "single",
        designation: "Software Engineer",
        departments: ["Engineering", "Design"],
        employeeType: "Permanent",
        duration: 0,
        salary: 800000,
        dob: new Date(1990, 0, 10),
        workStartDay: new Date(2024, 0, 1),
        phones: [
          { type: "Personal", number: "09111111111", note: "" },
          { type: "Emergency", number: "09111111112", note: "Father" },
        ],
      },
      {
        name: "Su Mon",
        email: "sumon@ems.com",
        nrc: "12/BaHaNa(N)100002",
        current_address: "Yangon",
        permanent_address: "Yangon",
        gender: "female",
        maritalStatus: "single",
        designation: "Marketing Specialist",
        departments: ["Marketing"],
        employeeType: "Permanent",
        duration: 0,
        salary: 600000,
        dob: new Date(1992, 1, 11),
        workStartDay: new Date(2024, 1, 1),
        phones: [{ type: "Personal", number: "09222222222", note: "" }],
      },
      {
        name: "Zaw Lin",
        email: "zawlin@ems.com",
        nrc: "12/BaHaNa(N)100003",
        current_address: "Mandalay",
        permanent_address: "Mandalay",
        gender: "male",
        maritalStatus: "married",
        designation: "HR Manager",
        departments: ["Human Resources", "Finance"],
        employeeType: "Permanent",
        duration: 0,
        salary: 900000,
        dob: new Date(1988, 2, 12),
        workStartDay: new Date(2023, 5, 1),
        phones: [
          { type: "Personal", number: "09333333333", note: "" },
          { type: "Emergency", number: "09333333334", note: "Wife" },
        ],
      },
      {
        name: "Aye Chan",
        email: "ayechan@ems.com",
        nrc: "12/BaHaNa(N)100004",
        current_address: "Yangon",
        permanent_address: "Monywa",
        gender: "female",
        maritalStatus: "single",
        designation: "Accountant",
        departments: ["Finance"],
        employeeType: "Permanent",
        duration: 0,
        salary: 500000,
        dob: new Date(1994, 3, 13),
        workStartDay: new Date(2024, 3, 1),
        phones: [{ type: "Personal", number: "09444444444", note: "" }],
      },
      {
        name: "Min Thu",
        email: "minthu@ems.com",
        nrc: "12/BaHaNa(N)100005",
        current_address: "Yangon",
        permanent_address: "Yangon",
        gender: "male",
        maritalStatus: "married",
        designation: "UI/UX Designer",
        departments: ["Design"],
        employeeType: "Internship",
        duration: 3,
        salary: 0,
        dob: new Date(2001, 4, 14),
        workStartDay: new Date(2026, 0, 15),
        phones: [{ type: "Personal", number: "09555555555", note: "" }],
      },
      {
        name: "Nwe Nwe",
        email: "nwenwe@ems.com",
        nrc: "12/BaHaNa(N)100006",
        current_address: "Mandalay",
        permanent_address: "Sagaing",
        gender: "female",
        maritalStatus: "married",
        designation: "Senior Developer",
        departments: ["Engineering"],
        employeeType: "Permanent",
        duration: 0,
        salary: 700000,
        dob: new Date(1991, 5, 15),
        workStartDay: new Date(2023, 8, 1),
        phones: [
          { type: "Personal", number: "09666666666", note: "" },
          { type: "Emergency", number: "09666666667", note: "Mother" },
        ],
      },
      {
        name: "Kyaw Zin",
        email: "kyawzin@ems.com",
        nrc: "12/BaHaNa(N)100007",
        current_address: "Yangon",
        permanent_address: "Yangon",
        gender: "male",
        maritalStatus: "single",
        designation: "Content Writer",
        departments: ["Marketing"],
        employeeType: "Internship",
        duration: 3,
        salary: 0,
        dob: new Date(2002, 6, 16),
        workStartDay: new Date(2026, 7, 1),
        phones: [{ type: "Personal", number: "09777777777", note: "" }],
      },
      {
        name: "Thida Win",
        email: "thida@ems.com",
        nrc: "12/BaHaNa(N)100008",
        current_address: "Yangon",
        permanent_address: "Pathein",
        gender: "female",
        maritalStatus: "married",
        designation: "Finance Analyst",
        departments: ["Finance"],
        employeeType: "Permanent",
        duration: 0,
        salary: 850000,
        dob: new Date(1993, 7, 17),
        workStartDay: new Date(2024, 7, 1),
        phones: [
          { type: "Personal", number: "09888888888", note: "" },
          { type: "Emergency", number: "09888888889", note: "Husband" },
        ],
      },
      {
        name: "Myo Naing",
        email: "myonaing@ems.com",
        nrc: "12/BaHaNa(N)100009",
        current_address: "Mandalay",
        permanent_address: "Mandalay",
        gender: "male",
        maritalStatus: "single",
        designation: "Frontend Developer",
        departments: ["Engineering", "Design"],
        employeeType: "Probation",
        duration: 3,
        salary: 720000,
        dob: new Date(1996, 8, 18),
        workStartDay: new Date(2026, 6, 1),
        phones: [{ type: "Personal", number: "09999999991", note: "" }],
      },
      {
        name: "Hnin Si",
        email: "hninsi@ems.com",
        nrc: "12/BaHaNa(N)100010",
        current_address: "Yangon",
        permanent_address: "Yangon",
        gender: "female",
        maritalStatus: "single",
        designation: "Graphic Designer",
        departments: ["Design", "Marketing"],
        employeeType: "Probation",
        duration: 2,
        salary: 550000,
        dob: new Date(1998, 9, 19),
        workStartDay: new Date(2026, 7, 15),
        phones: [
          { type: "Personal", number: "09999999992", note: "" },
          { type: "Emergency", number: "09999999993", note: "Mother" },
        ],
      },
    ];

    const employees = [];
    for (let i = 0; i < employeeRecords.length; i++) {
      const record = employeeRecords[i];
      const imageFile = employeeImageName(record.name);
      const imagePath = path.join(uploadsDir, imageFile);

      const user = await User.create({
        name: record.name,
        email: record.email,
        nrc: record.nrc,
        current_address: record.current_address,
        permanent_address: record.permanent_address,
        password: hashedPassword,
        role: "employee",
        profileImage: fs.existsSync(imagePath) ? imageFile : "",
      });

      for (const phone of record.phones) {
        await Phone.create({
          userId: user._id,
          type: phone.type,
          number: phone.number,
          note: phone.note || "",
        });
      }

      const { startDuration, endDuration } = durationDates(
        record.employeeType,
        record.duration,
        record.workStartDay
      );

      const employee = await Employee.create({
        userId: user._id,
        employeeId: `EMP-${String(i + 1).padStart(3, "0")}`,
        dob: record.dob,
        gender: record.gender,
        maritalStatus: record.maritalStatus,
        designation: record.designation,
        department: departmentByName[record.departments[0]],
        departments: record.departments.map((name) => departmentByName[name]),
        salary: record.salary,
        ...leaveBalances(record.employeeType, record.gender),
        employeeType: record.employeeType,
        duration: record.duration,
        startDuration,
        endDuration,
        workStartDay: record.workStartDay,
      });

      employees.push(employee);
    }

    console.log("Created employees and phone numbers");

    const leaveRequests = [
      {
        empIdx: 0,
        leaveType: "Annual Leave",
        startDate: new Date(2026, 6, 10),
        endDate: new Date(2026, 6, 12),
        description: "Family vacation trip",
        status: "Pending",
        votes: [],
        halfDay: { type: "none", session: "morning" },
      },
      {
        empIdx: 1,
        leaveType: "Casual Leave",
        startDate: new Date(2026, 6, 5),
        endDate: new Date(2026, 6, 5),
        description: "Personal errand",
        status: "Approved",
        votes: [{ adminId: admin._id, status: "Approved" }],
        halfDay: { type: "none", session: "morning" },
      },
      {
        empIdx: 2,
        leaveType: "Medical Leave",
        startDate: new Date(2026, 6, 7),
        endDate: new Date(2026, 6, 9),
        description: "Doctor appointment and recovery",
        status: "Pending",
        votes: [],
        halfDay: { type: "none", session: "morning" },
      },
      {
        empIdx: 3,
        leaveType: "Annual Leave",
        startDate: new Date(2026, 6, 14),
        endDate: new Date(2026, 6, 16),
        description: "Attending a wedding",
        status: "Rejected",
        votes: [{ adminId: admin._id, status: "Rejected" }],
        halfDay: { type: "none", session: "morning" },
      },
      {
        empIdx: 5,
        leaveType: "Maternity, and Paternity Leave",
        startDate: new Date(2026, 7, 1),
        endDate: new Date(2026, 9, 28),
        description: "Maternity leave",
        status: "Approved",
        votes: [{ adminId: admin._id, status: "Approved" }],
        halfDay: { type: "none", session: "morning" },
      },
      {
        empIdx: 7,
        leaveType: "Casual Leave",
        startDate: new Date(2026, 6, 20),
        endDate: new Date(2026, 6, 20),
        description: "Moving to new apartment",
        status: "Pending",
        votes: [],
        halfDay: { type: "start", session: "morning" },
      },
      {
        empIdx: 0,
        leaveType: "Medical Leave",
        startDate: new Date(2026, 5, 20),
        endDate: new Date(2026, 5, 21),
        description: "Dental surgery",
        status: "Approved",
        votes: [{ adminId: admin._id, status: "Approved" }],
        halfDay: { type: "none", session: "morning" },
      },
      {
        empIdx: 6,
        leaveType: "Unpaid Leave",
        startDate: new Date(2026, 7, 5),
        endDate: new Date(2026, 7, 10),
        description: "Extended personal travel",
        status: "Pending",
        votes: [],
        halfDay: { type: "none", session: "morning" },
      },
      {
        empIdx: 8,
        leaveType: "Unpaid Leave",
        startDate: new Date(2026, 8, 3),
        endDate: new Date(2026, 8, 3),
        description: "Urgent family matter",
        status: "Rejected",
        votes: [{ adminId: admin._id, status: "Rejected" }],
        halfDay: { type: "none", session: "morning" },
      },
    ];

    const leaveTypeMap = {
      "Annual Leave": "annualLeave",
      "Casual Leave": "casualLeave",
      "Medical Leave": "medicalLeave",
      "Maternity, and Paternity Leave": "maternityLeave",
    };

    const leaveDays = (startDate, endDate, halfDay = {}) => {
      const ms = new Date(endDate) - new Date(startDate);
      let days = Math.ceil(ms / (1000 * 60 * 60 * 24)) + 1;
      if (halfDay.type === "start" || halfDay.type === "end") days -= 0.5;
      return days;
    };

    for (const lr of leaveRequests) {
      await Leave.create({
        employeeId: employees[lr.empIdx]._id,
        leaveType: lr.leaveType,
        startDate: lr.startDate,
        endDate: lr.endDate,
        description: lr.description,
        status: lr.status,
        votes: lr.votes,
        halfDay: lr.halfDay,
      });

      if (lr.status === "Approved" && lr.leaveType !== "Unpaid Leave") {
        const employee = employees[lr.empIdx];
        const balanceKey = leaveTypeMap[lr.leaveType];
        const days = leaveDays(lr.startDate, lr.endDate, lr.halfDay);
        if (balanceKey && employee[balanceKey] >= days) {
          employee[balanceKey] -= days;
          await employee.save();
        }
      }
    }

    console.log("Created leave requests");

    const payDates = [
      new Date(Date.UTC(2026, 5, 28)),
      new Date(Date.UTC(2026, 6, 28)),
      new Date(Date.UTC(2026, 7, 28)),
    ];

    for (let i = 0; i < employees.length; i++) {
      const record = employeeRecords[i];
      if (record.employeeType === "Internship" || record.salary <= 0) continue;

      for (let monthIdx = 0; monthIdx < payDates.length; monthIdx++) {
        const overtime = monthIdx === 1 ? 50000 : 0;
        const kumoCareAllowance = 50000;
        const advanceSalary = i % 3 === 0 ? 100000 : 0;
        const absentDeduction = i % 4 === 0 ? 50000 : 0;
        const homageDeduction = 0;
        const birthdayBonus = 0;
        const yearEndBonus = 0;
        const totals = salaryTotals({
          basicSalary: record.salary,
          kumoCareAllowance,
          overtime,
          birthdayBonus,
          yearEndBonus,
          advanceSalary,
          homageDeduction,
          absentDeduction,
        });

        await Salary.create({
          employeeId: employees[i]._id,
          basicSalary: record.salary,
          kumoCareAllowance,
          overtime,
          birthdayBonus,
          yearEndBonus,
          advanceSalary,
          homageDeduction,
          absentDeduction,
          payDate: payDates[monthIdx],
          ...totals,
        });
      }
    }

    console.log("Created salary records");

    console.log("\n=== Seed Complete ===");
    console.log("\nLogin credentials (password: Admin@123):");
    console.log("  Admin: admin@ems.com");
    console.log("  Employee: htet@ems.com (or any employee email)");
    console.log(
      "\nAll employee emails:",
      employeeRecords.map((e) => e.email).join(", ")
    );

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

seed();
