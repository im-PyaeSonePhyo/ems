// stores/LeaveStore.js
import { makeAutoObservable, runInAction, toJS } from "mobx";
import api from "../utils/axios";
import dayjs from "dayjs";
import { toast } from "react-toastify";

class LeaveStore {
  allLeaves = [];
  leaves = [];
  leave = "";
  userId = "";
  formData = {
    leaveType: "",
    startDate: new Date(),
    endDate: new Date(),
    isHalfDay: false,
    halfDayType: "",
    description: "",
  };
  activeStatus = "All";

  // Status
  loading = false;
  error = null;
  errorMessage = {};

  constructor() {
    makeAutoObservable(this);
  }

  setUserId = (id) => {
    this.userId = id;
  };

  setField(name, value) {
    this[name] = value;
    this.error = null; // Reset error on change
  }

  handleChange = (e) => {
    const { name, value, checked } = e.target;
    this.formData[name] = value;

    if (name === "isHalfDay") {
      this.formData[name] = checked;
      this.formData["halfDayType"] = "morning";
    }

    if (value) {
      delete this.errorMessage[name];
    }
  };

  handleDate = (name, e) => {
    this.formData[name] = e;
  };

  validateForm = (data) => {
    const { leaveType, description } = data;

    if (!leaveType || leaveType.trim() === "") {
      this.errorMessage.leaveType = "Leave Type is required!";
    }

    if (!description || description.trim() === "") {
      this.errorMessage.description = "Description is required!";
    }
  };

  applyStatusFilter = () => {
    if (this.activeStatus === "All") {
      this.leaves = [...this.allLeaves];
      return;
    }

    this.leaves = this.allLeaves.filter(
      (leave) => leave.status?.toLowerCase() === this.activeStatus.toLowerCase()
    );
  };

  filteredByStatus = (status) => {
    this.activeStatus = status;
    this.applyStatusFilter();
  };

  changeStatus = (id, status, navigate) => {
    this.UpdateLeaveStatus(id, status, navigate);
  };

  // Fetch Leaves
  fetchLeaves = async (id) => {
    this.loading = true;
    this.error = null;

    try {
      const response = await api.get(`/leave/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      runInAction(() => {
        if (response.data.success) {
          this.leaves = response.data.leaves;
          this.loading = false;
        } else {
          this.error = response.data.error || "Failed to load leaves";
        }
      });
    } catch (error) {
      runInAction(() => {
        this.error = error?.response?.data?.error || "Server error";
      });
    }
  };

  // Fetch Leave
  fetchLeave = async (id) => {
    this.loading = true;
    this.error = null;

    try {
      const response = await api.get(`/leave/details/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      runInAction(() => {
        this.loading = false;
        if (response.data.success) {
          this.leave = response.data.leave;
          this.formData.leaveType = this.leave.leaveType || "";
          this.formData.startDate = this.leave.startDate ? new Date(this.leave.startDate) : new Date();
          this.formData.endDate = this.leave.endDate ? new Date(this.leave.endDate) : new Date();
          this.formData.isHalfDay = this.leave.halfDay.type || false;
          this.formData.halfDayType = this.leave.halfDay.session || "";
          this.formData.description = this.leave.description || "";
        } else {
          this.error = response.data.error || "Failed to load leave";
        }
      });
    } catch (error) {
      runInAction(() => {
        this.loading = false;
        this.error = error?.response?.data?.error || "Server error";
      });
    }
  };

  // Fetch Admin Leaves
  fetchAdminLeaves = async () => {
    this.loading = true;
    this.error = null;

    try {
      const response = await api.get("/leave", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      runInAction(() => {
        if (response.data.success) {
          this.allLeaves = response.data.leaves || [];
          this.applyStatusFilter();
        } else {
          this.error = response.data.error || "Failed to load admin leaves";
        }
        this.loading = false;
      });
    } catch (error) {
      runInAction(() => {
        this.loading = false;
        this.error = error?.response?.data?.error || "Server error";
      });
    }
  };

  // Create Leaves
  createLeave = (navigate) => async (e) => {
    e.preventDefault();
    this.loading = true;
    this.error = null;

    this.validateForm(this.formData);
    if (Object.keys(this.errorMessage).length === 0) {
      // Validate dates first
      const start = dayjs(this.formData.startDate);
      const end = dayjs(this.formData.endDate);

      if (!start.isValid() || !end.isValid()) {
        toast.error("Invalid date format");
        this.loading = false;
        return;
      }

      if (end.isBefore(start)) {
        toast.error("End date cannot be before start date");
        this.loading = false;
        return;
      }

      this.formData = {
        ...this.formData,
        userId: this.userId,
        halfDay: this.formData.isHalfDay
          ? {
              type: "start",
              session: this.formData.halfDayType || "morning",
            }
          : {
              type: "none",
              session: "morning",
            },
      };

      try {
        const response = await api.post("/leave/add", this.formData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        runInAction(() => {
          if (response.data.success) {
            this.leaves.push(response.data.leave);
            navigate(`../leaves/${this.userId}`);
            toast.success("Leave created successfully!");
          } else {
            this.error = response.data.error || "Failed to submit leave";
          }
        });
        this.resetForm();
        this.loading = false;

        // return response.data.leaves;
      } catch (error) {
        runInAction(() => {
          this.loading = false;
          toast.error(error?.response?.data?.error || "Failed to submit leave");
        });
      }
    }
  };

  // Update Leave
  updateLeave = (id, navigate) => async (e) => {
    e.preventDefault();
    this.loading = true;
    this.error = null;

    this.validateForm(this.formData);
    if (Object.keys(this.errorMessage).length === 0) {
      // Validate dates
      const start = dayjs(this.formData.startDate);
      const end = dayjs(this.formData.endDate);

      if (!start.isValid() || !end.isValid()) {
        toast.error("Invalid date format");
        this.loading = false;
        return;
      }

      if (end.isBefore(start)) {
        toast.error("End date cannot be before start date");
        this.loading = false;
        return;
      }

      const updatedFormData = {
        ...this.formData,
        userId: this.userId,
        halfDay: this.formData.isHalfDay
          ? {
              type: "start",
              session: this.formData.halfDayType || "morning",
            }
          : {
              type: "none",
              session: "morning",
            },
      };

      try {
        const response = await api.put(`/leave/${id}`, updatedFormData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        runInAction(() => {
          if (response.data.success) {
            const updatedLeave = response.data.leave;
            this.leaves = this.leaves.map((leave) =>
              leave._id === id ? updatedLeave : leave
            );
            navigate(`../leaves/${this.userId}`);
            toast.success("Leave updated successfully!");
          } else {
            this.error = response.data.error || "Failed to update leave";
          }
          this.loading = false;
        });

        this.resetForm();
      } catch (error) {
        runInAction(() => {
          this.loading = false;
          toast.error(error?.response?.data?.error || "Failed to update leave");
        });
      }
    }
  };

  // Update Leave
  UpdateLeaveStatus = async (id, status, navigate) => {
    this.loading = true;
    this.error = null;

    try {
      const response = await api.put(
        `/leave/details/${id}`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      runInAction(() => {
        this.loading = false;
        if (response.data.success) {
          this.leave = response.data.leave;
          toast.success("Leave status updated!");
          navigate("../leaves");
        } else {
          this.error = response.data.error || "Failed to update leave";
          toast.error(this.error);
        }
      });
    } catch (error) {
      runInAction(() => {
        this.loading = false;
        this.error = error?.response?.data?.error || "Server error";
        toast.error(this.error);
      });
    }
  };

  // Delete Leave
  deleteLeave = async (id) => {
    this.error = null;

    try {
      const token = localStorage.getItem("token");
      const response = await api.delete(`/leave/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      runInAction(() => {
        if (response.data.success) {
          this.allLeaves = this.allLeaves.filter((leave) => leave._id !== id);
          this.leaves = this.leaves.filter((leave) => leave._id !== id);
          toast.success(response.data.message)
        } else {
          this.error = response.data.error || "Failed to delete leave";
          toast.error(this.error)
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
      toast.error(this.error)
      return false;
    }
  };

  resetForm = () => {
    this.formData.leaveType = "";
    this.formData.startDate = new Date();
    this.formData.endDate = new Date();
    this.formData.isHalfDay = false;
    this.formData.halfDayType = "";
    this.formData.description = "";
  };
}

export const leaveStore = new LeaveStore();
