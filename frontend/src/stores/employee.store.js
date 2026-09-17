import { makeAutoObservable, runInAction, toJS } from "mobx";
import { toast } from "react-toastify";
import api from "../utils/axios";
import {
  CREATE_EMPLOYEE,
  UPDATE_EMPLOYEE,
  UPDATE_PROFILE_IMAGE,
} from "../components/constants/Constants";
import { BiCaretUpSquare } from "react-icons/bi";
import moment from "moment";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const IMAGE_EXTENSIONS = /\.(jpe?g|png|gif|webp|bmp)$/i;

const isValidEmail = (email) => EMAIL_REGEX.test(String(email || "").trim());

const normalizeEmail = (email) => String(email || "").trim().toLowerCase();

const isImageFile = (file) => {
  if (!file) return false;
  const name = file.name || "";
  const type = file.type || "";
  const hasImageExt = IMAGE_EXTENSIONS.test(name);
  const hasImageMime = !type || type.startsWith("image/");
  return hasImageExt && hasImageMime;
};

class EmployeeStore {
  employeeList = [];
  phones = [];
  loading = false;
  error = null;
  formData = {
    current_address: "",
    permanent_address: "",
    phones: [{ type: "", number: "", note: "" }],
    dob: null,
    workStartDay: null,
    departments: [],
  };
  employee = null;
  updatingProfileImage = false;
  showLeaves = false;
  showDuration = false;
  showSalary = false;
  errorMessage = {};
  updateData = {
    current_address: "",
    permanent_address: "",
    phones: [{ type: "", number: "", note: "" }],
    departments: [],
  };
  originalUpdateData = null;
  // Dynamic phone logic for Add
  handlePhoneChange = (idx, field, value) => {
    this.formData.phones[idx][field] = value;
    // Validate number
    if (field === "number") {
      this.formData.phones[idx][field] = value.replace(/\D/g, "").slice(0, 15);
    }
  };
  addPhoneRow = () => {
    this.formData.phones.push({ type: "", number: "", note: "" });
  };
  removePhoneRow = (idx) => {
    if (this.formData.phones.length > 1) this.formData.phones.splice(idx, 1);
  };

  // Dynamic phone logic for Update
  handleUpdatePhoneChange = (idx, field, value) => {
    this.updateData.phones[idx][field] = value;
    if (field === "number") {
      this.updateData.phones[idx][field] = value
        .replace(/\D/g, "")
        .slice(0, 15);
    }
  };
  addUpdatePhoneRow = () => {
    this.updateData.phones.push({ type: "", number: "", note: "" });
  };
  removeUpdatePhoneRow = (idx) => {
    if (this.updateData.phones.length > 1)
      this.updateData.phones.splice(idx, 1);
  };
  totalUpdateEmployee = [];
  showUniqueEmployee = false;

  constructor() {
    makeAutoObservable(this);
  }

  snapshotEmployeeUpdate = () => {
    const data = this.updateData;
    return {
      name: String(data.name ?? "").trim(),
      email: String(data.email ?? "").trim(),
      nrc: String(data.nrc ?? "").trim(),
      current_address: String(data.current_address ?? "").trim(),
      permanent_address: String(data.permanent_address ?? "").trim(),
      maritalStatus: String(data.maritalStatus ?? "").trim(),
      designation: String(data.designation ?? "").trim(),
      departments: (toJS(data.departments) || [])
        .map(String)
        .sort()
        .join(","),
      employeeType: String(data.employeeType ?? "").trim(),
      duration: String(data.duration ?? 0),
      salary: String(data.salary ?? 0),
      annualLeave: String(data.annualLeave ?? 0),
      casualLeave: String(data.casualLeave ?? 0),
      medicalLeave: String(data.medicalLeave ?? 0),
      maternityLeave: String(data.maternityLeave ?? 0),
      workStartDay: data.workStartDay
        ? new Date(data.workStartDay).toISOString()
        : "",
      phones: (toJS(data.phones) || []).map((phone) => ({
        type: String(phone.type ?? "").trim(),
        number: String(phone.number ?? "").trim(),
        note: String(phone.note ?? "").trim(),
      })),
    };
  };

  isEmailTaken = (email, excludeUserId = null) => {
    const normalized = normalizeEmail(email);
    if (!normalized) return false;

    return this.employeeList.some((emp) => {
      const user = emp.userId;
      if (!user || typeof user !== "object") return false;
      if (excludeUserId && String(user._id) === String(excludeUserId)) {
        return false;
      }
      return normalizeEmail(user.email) === normalized;
    });
  };

  emailValidationMessage = (email, excludeUserId = null) => {
    if (!email || String(email).trim() === "") {
      return "Please fill email!";
    }
    if (!isValidEmail(email)) {
      return "Please enter a valid email address!";
    }
    if (this.isEmailTaken(email, excludeUserId)) {
      return "This email is already registered!";
    }
    return null;
  };

  get hasEmployeeChanges() {
    if (!this.originalUpdateData) return false;
    if (this.updateData.image) return true;

    const current = this.snapshotEmployeeUpdate();
    const original = this.originalUpdateData;
    const fields = Object.keys(original).filter((key) => key !== "phones");
    if (fields.some((key) => current[key] !== original[key])) return true;
    if (current.phones.length !== original.phones.length) return true;

    return current.phones.some((phone, idx) => {
      const prev = original.phones[idx];
      return (
        phone.type !== prev.type ||
        phone.number !== prev.number ||
        phone.note !== prev.note
      );
    });
  }

  handleChange = (e) => {
    if (e?.target) {
      const { name, value, files } = e.target;
      if (name === "image") {
        const file = files?.[0];
        if (file && !isImageFile(file)) {
          this.formData.image = null;
          this.errorMessage.image = "Only image files are allowed!";
          e.target.value = "";
          return;
        }
        this.formData.image = file || null;
        delete this.errorMessage.image;
        return;
      }
      this.formData[name] = value;
      if (name === "email") {
        if (!value) {
          delete this.errorMessage.email;
        } else {
          const emailError = this.emailValidationMessage(value);
          if (emailError && emailError !== "Please fill email!") {
            this.errorMessage.email = emailError;
          } else {
            delete this.errorMessage.email;
          }
        }
      } else if (value) {
        delete this.errorMessage[name];
      }
      if (name === "employeeType") {
        if (value === "Permanent") {
          this.showLeaves = true;
          this.showDuration = false;
        } else {
          this.showLeaves = false;
          this.showDuration = true;
          const leaveFields = [
            "annualLeave",
            "casualLeave",
            "medicalLeave",
            "maternityLeave",
          ];
          leaveFields.forEach((leave) => (this.formData[leave] = 0));
        }

        if (value === "Internship") {
          this.showSalary = false;
          this.formData["salary"] = 0;
        } else {
          this.showSalary = true;
        }
        const date = new Date();
        this.formData["duration"] = 0;
      }
    } else if (e instanceof Date) {
      this.formData["dob"] = e;
    }
  };

  handleUpdateChange = (e) => {
    if (e?.target) {
      const { name, value, files } = e.target;
      if (name === "image") {
        const file = files?.[0];
        if (file && !isImageFile(file)) {
          this.updateData.image = null;
          this.errorMessage.image = "Only image files are allowed!";
          e.target.value = "";
          return;
        }
        this.updateData.image = file || null;
        delete this.errorMessage.image;
        return;
      }
      this.updateData[name] = value;
      if (name === "email") {
        if (!value) {
          delete this.errorMessage.email;
        } else {
          const emailError = this.emailValidationMessage(
            value,
            this.employee?.userId?._id
          );
          if (emailError && emailError !== "Please fill email!") {
            this.errorMessage.email = emailError;
          } else {
            delete this.errorMessage.email;
          }
        }
      } else if (value) {
        delete this.errorMessage[name];
      }
      if (name === "employeeType") {
        if (value === "Permanent") {
          this.showLeaves = true;
          this.showDuration = false;
        } else {
          this.showLeaves = false;
          this.showDuration = true;
          const leaveFields = [
            "annualLeave",
            "casualLeave",
            "medicalLeave",
            "maternityLeave",
          ];
          leaveFields.forEach((leave) => (this.updateData[leave] = 0));
        }

        if (value === "Internship") {
          this.showSalary = false;
          this.updateData["salary"] = 0;
        } else {
          this.showSalary = true;
        }
        const date = new Date(this.employee.createdAt);
        this.updateData["duration"] = 0;
        // this.updateData["endDuration"] = date.setFullYear(date.getFullYear()+10);
      }
    }
  };

  handleDepartmentsChange = (ids) => {
    this.formData.departments = ids;
    if (ids?.length) delete this.errorMessage.department;
    else this.errorMessage.department = "Please select at least one department!";
  };

  handleUpdateDepartmentsChange = (ids) => {
    this.updateData.departments = ids;
    if (ids?.length) delete this.errorMessage.department;
    else this.errorMessage.department = "Please select at least one department!";
  };

  handleDateChange = (name, value) => {
    this.formData[name] = value;
    this.errorMessage[name] = "";
  };

  handleDurationChange = (e) => {
    const value = Number(e.target.value);
    const { name } = e.target;
    if (value <= 3) {
      this.formData[name] = e.target.value;
      this.errorMessage[name] = "";
    } else {
      this.errorMessage[name] = "Please fill under 4 months";
    }
  };

  handleUpdateDurationChange = (e) => {
    const value = Number(e.target.value);
    const { name } = e.target;
    const startDate = new Date(this.employee.createdAt);
    const endDate = new Date(
      startDate.getFullYear(),
      startDate.getMonth() + value,
      startDate.getDate() - 1
    );
    this.updateData[name] = e.target.value;
    this.errorMessage[name] = "";
  };

  createEmployeeId = () => {
    const prefix = "EMP-";
    let maxId = 0;
    this.employeeList.forEach((emp) => {
      const match = emp.employeeId?.match(/(\d+)\s*$/);
      const idNumber = match ? Number(match[1]) : 0;
      if (idNumber > maxId) {
        maxId = idNumber;
      }
    });

    this.formData.employeeId = `${prefix}${String(maxId + 1).padStart(3, "0")}`;
  };

  validateField(field, message) {
    if (field === "" || field === null || field === undefined) {
      return message;
    }
    return null;
  }

  validateForm = (data) => {
    // Reset all error messages before validation
    this.errorMessage = {};
    // List of required fields
    const requiredFields = {
      name: "Please fill name!",
      email: "Please fill email!",
      nrc: "Please fill nrc!",
      current_address: "Please fill current address!",
      permanent_address: "Please fill permanent address!",
      password: "Please fill password!",
      maritalStatus: "Please select maritalStatus!",
      dob: "Please fill date of birth!",
      gender: "Please select gender!",
      employeeId: "Please fill employeeId!",
      employeeType: "Please select employee type!",
      workStartDay: "Please fill workStartDay!",
      designation: "Please fill designation!",
    };
    Object.entries(requiredFields).forEach(([key, message]) => {
      const error = this.validateField(data[key], message);
      if (error) this.errorMessage[key] = error;
      else delete this.errorMessage[key];
    });
    if (!Array.isArray(data.departments) || data.departments.length === 0) {
      this.errorMessage.department = "Please select at least one department!";
    } else {
      delete this.errorMessage.department;
    }
    const emailError = this.emailValidationMessage(data.email);
    if (emailError) {
      this.errorMessage.email = emailError;
    } else {
      delete this.errorMessage.email;
    }
    if (data.image && !isImageFile(data.image)) {
      this.errorMessage.image = "Only image files are allowed!";
    }
    // Validate phones
    if (!Array.isArray(data.phones) || data.phones.length === 0) {
      this.errorMessage.phones = "At least one phone number is required!";
    } else {
      data.phones.forEach((phone, idx) => {
        if (!phone.type || !phone.number) {
          this.errorMessage[`phones_${idx}`] =
            "Phone type and number required!";
        } else if (!/^\d{1,15}$/.test(phone.number)) {
          this.errorMessage[`phones_${idx}`] =
            "Phone number must be numeric and max 15 digits!";
        }
      });
    }

    // Conditional fields
    if (["Internship", "Probation"].includes(data.employeeType)) {
      const error = this.validateField(data.duration, "Please fill Duration!");
      if (error) this.errorMessage.duration = error;
      else delete this.errorMessage.duration;
    }
    if (["Probation", "Permanent"].includes(data.employeeType)) {
      const error = this.validateField(data.salary, "Please fill salary!");
      if (error) this.errorMessage.salary = error;
      else delete this.errorMessage.salary;
    }
    if (data.employeeType === "Permanent") {
      const leaveFields = {
        annualLeave: "Please fill annualLeave!",
        casualLeave: "Please fill casualLeave!",
        medicalLeave: "Please fill medicalLeave!",
        maternityLeave: "Please fill maternityLeave!",
      };
      Object.entries(leaveFields).forEach(([key, message]) => {
        const error = this.validateField(data[key], message);
        if (error) this.errorMessage[key] = error;
        else delete this.errorMessage[key];
      });
    }
  };

  fetchPhones = async (userId, { apply = true } = {}) => {
    if (!userId) {
      if (apply) {
        runInAction(() => {
          this.phones = [];
        });
      }
      return [];
    }
    try {
      const token = localStorage.getItem("token");
      const res = await api.get(`/employee/${userId}/phones`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const phones = res.data.success ? res.data.phones || [] : [];
      if (apply) {
        runInAction(() => {
          this.phones = phones;
        });
      }
      return phones;
    } catch (err) {
      if (apply) {
        runInAction(() => {
          this.phones = [];
        });
      }
      return [];
    }
  };

  updateValidateForm = (data) => {
    const {
      name,
      email,
      nrc,
      current_address,
      permanent_address,
      maritalStatus,
      designation,
      departments,
      department,
      employeeType,
      workStartDay,
      duration,
      salary,
      annualLeave,
      casualLeave,
      medicalLeave,
      maternityLeave,
    } = data;
    if (name === "" || !name) {
      this.errorMessage["name"] = "Please fill name!";
    } else {
      delete this.errorMessage["name"];
    }
    const emailError = this.emailValidationMessage(
      email,
      this.employee?.userId?._id
    );
    if (emailError) {
      this.errorMessage.email = emailError;
    } else {
      delete this.errorMessage.email;
    }
    // Remove phone validation for update
    if (nrc === "" || !nrc) {
      this.errorMessage.nrc = "Please fill nrc!";
    } else {
      delete this.errorMessage.nrc;
    }
    if (current_address === "" || !current_address) {
      this.errorMessage.current_address = "Please fill current address!";
    } else {
      delete this.errorMessage.current_address;
    }
    if (permanent_address === "" || !permanent_address) {
      this.errorMessage.permanent_address = "Please fill permanent address!";
    } else {
      delete this.errorMessage.permanent_address;
    }
    if (maritalStatus === "" || !maritalStatus) {
      this.errorMessage.maritalStatus = "Please select maritalStatus!";
    } else {
      delete this.errorMessage.maritalStatus;
    }

    if (employeeType === "" || !employeeType) {
      this.errorMessage.employeeType = "Please select employee type!";
    } else {
      delete this.errorMessage.employeeType;
    }
    if (employeeType === "Permanent") {
      if (workStartDay === "" || !workStartDay) {
        this.errorMessage.duration = "Please fill workStartDay!";
      } else {
        delete this.errorMessage.duration;
      }
    }
    if (employeeType === "Internship" || employeeType === "Probation") {
      if (duration === 0 || !duration) {
        this.errorMessage.duration = "Please fill Duration!";
      } else {
        delete this.errorMessage.duration;
      }
    }
    if (employeeType === "Probation" || employeeType === "Permanent") {
      if (salary === 0 || !salary) {
        this.errorMessage.salary = "Please fill salary!";
      } else {
        delete this.errorMessage.salary;
      }
    }
    if (employeeType === "Permanent") {
      if (annualLeave === 0 || !annualLeave) {
        this.errorMessage.annualLeave = "Please fill annualLeave!";
      } else {
        delete this.errorMessage.annualLeave;
      }
      if (casualLeave === 0 || !casualLeave) {
        this.errorMessage.casualLeave = "Please fill casualLeave!";
      } else {
        delete this.errorMessage.casualLeave;
      }
      if (medicalLeave === 0 || !medicalLeave) {
        this.errorMessage.medicalLeave = "Please fill medicalLeave!";
      } else {
        delete this.errorMessage.medicalLeave;
      }
      if (maternityLeave === 0 || !maternityLeave) {
        this.errorMessage.maternityLeave = "Please fill maternityLeave!";
      } else {
        delete this.errorMessage.maternityLeave;
      }
    }

    if (!Array.isArray(departments) || departments.length === 0) {
      if (department) {
        delete this.errorMessage.department;
      } else {
        this.errorMessage.department = "Please select at least one department!";
      }
    } else {
      delete this.errorMessage.department;
    }
    if (designation === null || !designation) {
      this.errorMessage.designation = "Please fill designation!";
    } else {
      delete this.errorMessage.designation;
    }
  };

  fetchEmployees = async () => {
    this.loading = true;
    try {
      const response = await api.get("/employee", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      runInAction(() => {
        if (response.data.success) {
          this.employeeList = response.data.employees;
        } else {
          this.error = response.data.error || "Failed to fetch employees";
          toast.error(this.error);
        }
      });
    } catch (error) {
      runInAction(() => {
        this.error =
          error?.response?.data?.error || error.message || "Server Error";
        toast.error(this.error);
      });
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  };

  handleSubmit = (navigate) => async (e) => {
    e.preventDefault();
    this.validateForm(this.formData);
    if (Object.keys(this.errorMessage).length > 0) {
      console.log("Form has error!", this.errorMessage);
      toast.error("Please fix the highlighted fields.");
      return;
    }

    this.formData.role = "employee";

    const formDataObj = new FormData();
    Object.keys(this.formData).forEach((key) => {
      if (key === "phones") {
        formDataObj.append("phones", JSON.stringify(this.formData.phones));
        return;
      }
      if (key === "departments") {
        formDataObj.append(
          "departments",
          JSON.stringify(toJS(this.formData.departments) || [])
        );
        return;
      }

      const value = this.formData[key];
      if (value === undefined || value === null) return;
      formDataObj.append(key, value);
    });

    try {
      const response = await api.post("/employee/add", formDataObj, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (response.data.success) {
        toast.success(CREATE_EMPLOYEE);
        this.fetchEmployees();
        this.resetFormData();
        navigate(-1);
        return;
      }

      toast.error(response.data.error || "Failed to create employee");
    } catch (error) {
      toast.error(error?.response?.data?.error || error.message || "Server Error");
    }
  };

  handleCancel = (navigate) => (e) => {
    e.preventDefault();
    navigate("../employees");
  };

  fetchEmployee = async (id) => {
    const isSameEmployee =
      this.employee &&
      (String(this.employee._id) === String(id) ||
        String(this.employee.userId?._id) === String(id));

    if (!isSameEmployee) {
      runInAction(() => {
        this.employee = null;
        this.phones = [];
      });
    }

    try {
      const response = await api.get(`/employee/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (response.data.success) {
        const employee = response.data.employee;
        const user = employee.userId;
        const phones = await this.fetchPhones(user._id, { apply: false });

        runInAction(() => {
          this.employee = employee;
          this.phones = phones;
          this.updateData.name = user.name;
          this.updateData.email = user.email;
          this.updateData.nrc = user.nrc;
          this.updateData.current_address = user.current_address;
          this.updateData.permanent_address = user.permanent_address;
          this.updateData.role = user.role;
          this.updateData.profile = user.profileImage;
          const assignedDepartments =
            Array.isArray(employee.departments) && employee.departments.length
              ? employee.departments
              : employee.department
              ? [employee.department]
              : [];
          this.updateData.departments = assignedDepartments.map((dep) =>
            String(dep._id || dep)
          );
          this.updateData.department = this.updateData.departments[0] || "";
          this.updateData.maritalStatus = employee.maritalStatus;
          this.updateData.salary = employee.salary;
          this.updateData.designation = employee.designation;
          this.updateData.employeeType = employee.employeeType;
          this.updateData.workStartDay = employee.workStartDay;
          this.updateData.duration = employee.duration;
          this.updateData.annualLeave = employee.annualLeave;
          this.updateData.casualLeave = employee.casualLeave;
          this.updateData.medicalLeave = employee.medicalLeave;
          this.updateData.maternityLeave = employee.maternityLeave;
          this.updateData.phones =
            phones.length > 0
              ? toJS(phones)
              : [{ type: "", number: "", note: "" }];
          this.originalUpdateData = this.snapshotEmployeeUpdate();
        });
      }
    } catch (error) {
      console.log("error,", error);
      if (error.response && !error.response.data.success) {
        toast.error(error.response.data.error);
      }
    }
  };

  updateProfileImage = async (file) => {
    if (!file) {
      toast.error("Please choose an image!");
      return false;
    }
    if (!isImageFile(file)) {
      toast.error("Only image files are allowed!");
      return false;
    }

    this.updatingProfileImage = true;
    try {
      const formDataObj = new FormData();
      formDataObj.append("image", file);
      const response = await api.put("/employee/profile-image", formDataObj, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.data.success) {
        runInAction(() => {
          if (this.employee?.userId) {
            this.employee.userId.profileImage = response.data.profileImage;
          }
          this.updateData.profile = response.data.profileImage;
        });
        toast.success(UPDATE_PROFILE_IMAGE);
        return true;
      }

      toast.error(response.data.error || "Failed to update profile photo");
      return false;
    } catch (error) {
      toast.error(
        error?.response?.data?.error || error.message || "Server Error"
      );
      return false;
    } finally {
      runInAction(() => {
        this.updatingProfileImage = false;
      });
    }
  };

  updateEmployee = (id, key, navigate) => async (e) => {
    e.preventDefault();

    if (!this.hasEmployeeChanges) {
      toast.info("No changes to update.");
      return;
    }

    this.updateValidateForm(this.updateData);
    const formDataObj = new FormData();
    Object.keys(this.updateData).forEach((field) => {
      if (field === "phones") {
        formDataObj.append("phones", JSON.stringify(this.updateData.phones));
      } else if (field === "departments") {
        formDataObj.append(
          "departments",
          JSON.stringify(toJS(this.updateData.departments) || [])
        );
      } else {
        formDataObj.append(field, this.updateData[field]);
      }
    });

    const hasValidationErrors = Object.values(this.errorMessage).some(Boolean);
    if (!hasValidationErrors) {
      try {
        const response = await api.put(`/employee/${id}`, formDataObj, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (response.data.success) {
          toast.success(UPDATE_EMPLOYEE);
          navigate("../employees");
        }
      } catch (error) {
        if (error.response && !error.response.data.success) {
          toast.error(error.response.data.error);
        }
      }
      this.resetFormData();
      this.fetchEmployee(id);
    } else {
      toast.error("Please fix the highlighted fields.");
    }
  };

  deleteEmployee = async (id) => {
    this.error = null;

    try {
      const token = localStorage.getItem("token");
      const response = await api.delete(`/employee/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      runInAction(() => {
        if (response.data.success) {
          this.employeeList = this.employeeList.filter((emp) => emp._id !== id);
        } else {
          this.error = response.data.error || "Failed to delete employee";
        }
      });

      return response.data.success;
    } catch (error) {
      runInAction(() => {
        this.error =
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          "Server error";
      });
      return false;
    }
  };

  resetFormData = () => {
    this.formData = {
      name: "",
      email: "",
      nrc: "",
      current_address: "",
      permanent_address: "",
      password: "",
      maritalStatus: "",
      dob: null,
      gender: "",
      employeeId: "",
      employeeType: "",
      workStartDay: null,
      duration: 0,
      endDuration: null,
      role: "employee",
      department: "",
      departments: [],
      designation: "",
      salary: 0,
      image: null,
      annualLeave: 0,
      casualLeave: 0,
      medicalLeave: 0,
      maternityLeave: 0,
      phones: [{ type: "", number: "", note: "" }],
    };
  };

  resetErrorMessage = () => {
    const resetError = [
      "name",
      "email",
      "phone",
      "emergencyPhone",
      "nrc",
      "address",
      "password",
      "image",
      "maritalStatus",
      "dob",
      "gender",
      "employeeId",
      "employeeType",
      "role",
      "department",
      "designation",
      "workStartDay",
      "duration",
      "salary",
      "annualLeave",
      "casualLeave",
      "medicalLeave",
      "maternityLeave",
    ];
    resetError.forEach((key) => (this.errorMessage[key] = ""));
  };

  countEmployee = () => {
    const currentDate = moment().startOf("day");
    this.totalUpdateEmployee = this.employeeList.filter((emp) => {
      const localDate = new Date(emp.endDuration);
      const utcDate = new Date(
        localDate.getTime() + localDate.getTimezoneOffset() * 60000
      );
      const endDate = moment(utcDate).startOf("day");
      const isSameDate = currentDate.isSame(endDate);
      const isEndBeforeCurrent = endDate.isBefore(currentDate);
      return isSameDate || isEndBeforeCurrent;
    });
    this.employeeList = this.totalUpdateEmployee;
  };

  handleShowUniqueEmployee = (value) => {
    runInAction(() => {
      this.showUniqueEmployee = value;
    });
  };
}

export const employeeStore = new EmployeeStore();
