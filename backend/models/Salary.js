import mongoose, { Schema } from "mongoose";

const salarySchema = new Schema({
  basicSalary: { type: Number, default: 0 },
  employeeId: { type: Schema.Types.ObjectId, ref: "Employee", required: true },
  kumoCareAllowance: { type: Number, default: 0 },
  overtime: { type: Number, default: 0 },
  birthdayBonus: { type: Number, default: 0 },
  yearEndBonus: { type: Number, default: 0 },
  revenueTotal: { type: Number },
  advanceSalary: { type: Number, default: 0 },
  homageDeduction: { type: Number, default: 0 },
  absentDeduction: { type: Number, default: 0 },
  deductionTotal: { type: Number },
  netSalary: { type: Number },
  payDate: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

salarySchema.index({ employeeId: 1, payDate: 1 }, { unique: true });

const Salary = mongoose.model("Salary", salarySchema);
export default Salary;
