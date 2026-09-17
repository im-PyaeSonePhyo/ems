import React, { useEffect } from "react";
import PageLayout from "../layout/PageLayout";
import { observer } from "mobx-react-lite";
import Card from "../common/Card";
import {
  Users,
  Building,
  DollarSign,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  UserPen,
} from "lucide-react";
import { adminOverviewStore } from "../../stores/adminOverview.store";
import { employeeStore } from "../../stores/employee.store";
import { leaveStore } from "../../stores/leave.store";
import { salaryStore } from "../../stores/salary.store";

const AdminOverview = observer(() => {
  const { overviewData, loading, fetchOverviewData } = adminOverviewStore;
  const { fetchEmployees, countEmployee, handleShowUniqueEmployee } =
    employeeStore;
  const { filteredByStatus } = leaveStore;
  const { salaryCollections, fetchSalaryCollections } = salaryStore;

  useEffect(() => {
    fetchOverviewData();
    fetchEmployees();
    fetchSalaryCollections();
    countEmployee();
  }, []);

  return (
    <PageLayout title={"Admin Dashboard"}>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        <span onClick={() => handleShowUniqueEmployee(false)}>
          <Card
            name="Total Employees"
            icon={Users}
            value={loading || !overviewData ? "-" : overviewData.totalEmployees}
            color="oklch(71.5% 0.143 215.221)"
            to="employees"
            isLoading={loading}
          />
        </span>
        <Card
          name="Total Departments"
          icon={Building}
          value={loading || !overviewData ? "-" : overviewData.totalDepartments}
          color="oklch(62.7% 0.265 303.9)"
          to="departments"
          isLoading={loading}
        />
        <Card
          name="Monthly Pay"
          icon={DollarSign}
          value={
            loading || !salaryCollections?.length
              ? "-"
              : salaryCollections[0]?.totalNetSalary
          }
          color="oklch(72.3% 0.219 149.579)"
          isLoading={loading}
        />
        <span onClick={() => filteredByStatus("All")}>
          <Card
            name="Leave Applied"
            icon={FileText}
            value={
              loading || !overviewData
                ? "-"
                : overviewData.leaveSummary.appliedFor
            }
            color="oklch(62.3% 0.214 259.815)"
            to="leaves"
            isLoading={loading}
          />
        </span>
        <span onClick={() => filteredByStatus("Approved")}>
          <Card
            name="Leave Approved"
            icon={CheckCircle}
            value={
              loading || !overviewData
                ? "-"
                : overviewData.leaveSummary.approved
            }
            color="oklch(62.3% 0.214 259.815)"
            to="leaves"
            isLoading={loading}
          />
        </span>
        <span onClick={() => filteredByStatus("Pending")}>
          <Card
            name="Leave Pending"
            icon={Clock}
            value={
              loading || !overviewData ? "-" : overviewData.leaveSummary.pending
            }
            color="oklch(79.5% 0.184 86.047)"
            to="leaves"
            isLoading={loading}
          />
        </span>
        <span onClick={() => filteredByStatus("Rejected")}>
          <Card
            name="Leave Rejected"
            icon={XCircle}
            value={
              loading || !overviewData
                ? "-"
                : overviewData.leaveSummary.rejected
            }
            color="oklch(63.7% 0.237 25.331)"
            to="leaves"
            isLoading={loading}
          />
        </span>
        <span onClick={() => handleShowUniqueEmployee(true)}>
          <Card
            name="To Promote Employee"
            icon={UserPen}
            value={
              loading || !overviewData
                ? "-"
                : overviewData.totalPromoteEmployees
            }
            color="oklch(70.5% 0.213 47.604)"
            to="employees"
            isLoading={loading}
          />
        </span>
      </div>
    </PageLayout>
  );
});

export default AdminOverview;
