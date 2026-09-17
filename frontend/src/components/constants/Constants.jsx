import { values } from "mobx";

// Employee Constant
export const EMPLOYEE_TABLE_HEADER = [
  "Serial Number",
  "Employee Id",
  "Name",
  "Image",
  "Department",
  "Employee Type",
  "Actions",
];
export const GENDER_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
];

export const MARITAL_STATUS_OPTIONS = [
  { value: "single", label: "Single" },
  { value: "married", label: "Married" },
];

export const EMPLOYEE_TYPE = [
  { value: "Internship", label: "Internship" },
  { value: "Probation", label: "Probation" },
  { value: "Permanent", label: "Permanent" },
];

export const CREATE_EMPLOYEE = "Employee created successfully!";
export const UPDATE_EMPLOYEE = "Employee updated successfully!";
export const UPDATE_PROFILE_IMAGE = "Profile photo updated successfully!";

// Department
export const DEPARTMENT_TABLE_HEADER = ["Serial Number", "Name", "Actions"];

//Leave
export const LEAVE_TYPE_OPTIONS = [
  { value: "Casual Leave", label: "Casual Leave" },
  { value: "Annual Leave", label: "Annual Leave" },
  { value: "Medical Leave", label: "Medical Leave" },
  {
    value: "Maternity, and Paternity Leave",
    label: "Maternity, and Paternity Leave",
  },
  { value: "Unpaid Leave", label: "Unpaid Leave" },
];

export const HALF_DAY_OPTIONS = [
  { value: "morning", label: "Morning" },
  { value: "evening", label: "Evening" },
];

export const ADMIN_LEAVE_LIST_HEADER = [
  "Serial Number",
  "Employee Id",
  "Name",
  "Leave Type",
  "Department",
  "Days",
  "Status",
  "Action",
];

export const LEAVE_LIST_HEADER_ADMIN = [
  "Serial Number",
  "Leave Type",
  "Start Date",
  "End Date",
  "Half Day",
  "Reason",
  "Status",
];

export const LEAVE_LIST_HEADER_EMPLOYEE = [
  "Serial Number",
  "Leave Type",
  "Start Date",
  "End Date",
  "Half Day",
  "Reason",
  "Status",
  "Action"
];

//Salary
export const SALARY_HEADER = [
  "Serial Number",
  "Employee Id",
  "Employee Name",
  "Salary",
  "Allowance",
  "Deduction",
  "Total",
  "Pay Date",
  "Download"
];

export const ADD_SALARY_HEADER = [
  "Employee ID",
  "Employee Name",
  "Basic Salary",
  "Overtime",
  "Advance Salary",
  "Absent Deduction",
  "Year End Bonus",
  "Birthday Bonus",
];

export const SALARY_INPUT_FIELDS = [
  "overtime",
  "advanceSalary",
  "absentDeduction",
  "yearEndBonus",
  "birthdayBonus",
];

export const SALARY_DEFAULT_LABEL = [
  { name: "kumoCareAllowance", label: "Kumo Care Allowance" },
  { name: "homageDeduction", label: "Homage Deduction" },
];

export const SAME_MONTH_SALARY_LIST_HEADER = [
  "Serial Number",
  "Total Employees",
  "Total Salary",
  "Date",
  "Action",
];
