import { makeAutoObservable, runInAction } from "mobx";
import api from "../utils/axios";

class EmployeeOverviewStore {
  overviewData = {
    name: "",
    designation: "-",
    employeeType: "-",
    department: "-",
    leaveSummary: { appliedFor: 0, approved: 0, pending: 0, rejected: 0 },
    leaveBalance: {
      annualLeave: 0,
      casualLeave: 0,
      medicalLeave: 0,
      maternityLeave: 0,
    },
    latestNetSalary: null,
  };

  loading = false;
  error = null;

  constructor() {
    makeAutoObservable(this);
  }

  fetchOverviewData = async () => {
    this.loading = true;
    this.error = null;

    try {
      const token = localStorage.getItem("token");
      const response = await api.get("/dashboard/employee-summary", {
        headers: { Authorization: `Bearer ${token}` },
      });

      runInAction(() => {
        if (response.data.success) {
          const { employee, leaveSummary, latestSalary } = response.data;
          this.overviewData = {
            name: employee?.name || "",
            designation: employee?.designation || "-",
            employeeType: employee?.employeeType || "-",
            department: employee?.department || "-",
            leaveSummary: {
              appliedFor: leaveSummary?.appliedFor || 0,
              approved: leaveSummary?.approved || 0,
              pending: leaveSummary?.pending || 0,
              rejected: leaveSummary?.rejected || 0,
            },
            leaveBalance: {
              annualLeave: employee?.annualLeave || 0,
              casualLeave: employee?.casualLeave || 0,
              medicalLeave: employee?.medicalLeave || 0,
              maternityLeave: employee?.maternityLeave || 0,
            },
            latestNetSalary:
              latestSalary?.netSalary === undefined ||
              latestSalary?.netSalary === null
                ? null
                : latestSalary.netSalary,
          };
        } else {
          this.error =
            response.data.error || "Failed to fetch overview data";
        }
      });
    } catch (error) {
      runInAction(() => {
        this.error =
          error.response?.data?.error || error.message || "Server error";
      });
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  };
}

export const employeeOverviewStore = new EmployeeOverviewStore();
