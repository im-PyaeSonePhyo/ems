import mongoose, { Schema } from "mongoose";
import User from "./User.js";
import Leave from "./Leave.js";
import Salary from "./Salary.js";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const employeeSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  employeeId: { type: String, required: true, unique: true },
  dob: { type: Date, required: true },
  gender: { type: String, required: true },
  maritalStatus: { type: String, required: true },
  designation: { type: String, required: true },
  department: {
    type: Schema.Types.ObjectId,
    ref: "Department",
  },
  departments: [
    {
      type: Schema.Types.ObjectId,
      ref: "Department",
    },
  ],
  salary: { type: Number, default: 0 },
  annualLeave: { type: Number, default: 0 },
  casualLeave: { type: Number, default: 0 },
  medicalLeave: { type: Number, default: 0 },
  maternityLeave: { type: Number, default: 0 },
  employeeType: { type: String, required: true},
  duration: { type: Number, default: 0 },
  startDuration: { type: Date},
  endDuration: { type: Date },
  workStartDay: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

employeeSchema.pre("deleteOne", {document : true, query : false}, async function (next) {
  try{
    const empId = this._id;
    const userId = this.userId;
    const user = await User.findById(userId);

    // Delete user image if exists
    if (user && user.profileImage) {
      const imagePath = path.join(__dirname, "..", "public", "uploads", user.profileImage);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    await User.deleteOne({_id : userId})
    await Leave.deleteMany({employeeId : empId })
    await Salary.deleteMany({employeeId : empId })
    next()
  } catch(error) {
    next(error)
  }
})

const Employee = mongoose.model("Employee", employeeSchema);
export default Employee;
