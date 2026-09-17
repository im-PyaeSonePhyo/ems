import Department from "../models/Department.js";
import Employee from "../models/Employee.js";

const getDepartments = async (req, res) => {
  try {
    const departments = await Department.find().lean();
    const counts = await Employee.aggregate([
      {
        $project: {
          depIds: {
            $setUnion: [
              {
                $cond: [
                  { $ifNull: ["$department", false] },
                  ["$department"],
                  [],
                ],
              },
              { $ifNull: ["$departments", []] },
            ],
          },
        },
      },
      { $unwind: "$depIds" },
      { $group: { _id: "$depIds", count: { $sum: 1 } } },
    ]);
    const countById = counts.reduce((acc, item) => {
      acc[String(item._id)] = item.count;
      return acc;
    }, {});

    const departmentsWithCount = departments.map((dep) => ({
      ...dep,
      employeeCount: countById[String(dep._id)] || 0,
    }));

    return res.status(200).json({ success: true, departments: departmentsWithCount });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: "get department server error" });
  }
};

const addDepartment = async (req, res) => {
  try {
    const { dep_name, description } = req.body;
    const newDep = new Department({
      dep_name,
      description,
    });
    await newDep.save();
    return res.status(200).json({ success: true, department: newDep });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: "add department server error" });
  }
};

const getDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const department = await Department.findById({ _id: id });
    return res.status(200).json({ success: true, department });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: "get department server error" });
  }
};

const updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { dep_name, description } = req.body;
    const updateDep = await Department.findByIdAndUpdate(
      { _id: id },
      {
        dep_name,
        description,
      }
    );
    return res.status(200).json({ success: true, updateDep });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: "edit department server error" });
  }
};

const deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    // const deleteDep = await Department.findById({ _id: id });
    // await deleteDep.deleteOne();
    const employeeCount = await Employee.countDocuments({
      $or: [{ department: id }, { departments: id }],
    });

    if (employeeCount > 0) {
      return res.status(400).json({
        success: false,
        error: "Cannot delete department. Employees are assigned to this department.",
      });
    }

    // If no employees, proceed with deletion
    await Department.findByIdAndDelete(id);
    return res.status(200).json({ success: true, message: "Department deleted successfully." });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: "delete department server error" });
  }
};

export {
  getDepartments,
  addDepartment,
  getDepartment,
  updateDepartment,
  deleteDepartment,
};
