import React, { useEffect } from "react";
import PageLayout from "../layout/PageLayout";
import { observer } from "mobx-react-lite";
import Card from "../common/Card";
import {
  User,
  Building,
  Briefcase,
  DollarSign,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  Calendar,
  Sun,
  Heart,
  Baby,
} from "lucide-react";
import { authStore } from "../../stores/auth.store";
import { employeeOverviewStore } from "../../stores/employeeOverview.store";

const formatMoney = (value) => {
  if (value === null || value === undefined) return "-";
  return Number(value).toLocaleString();
};

const EmployeeOverview = observer(() => {
  const { user } = authStore;
  const { overviewData, loading, fetchOverviewData } = employeeOverviewStore;

  useEffect(() => {
    if (user?._id) {
      fetchOverviewData();
    }
  }, [user?._id]);

  const profilePath = user?._id ? `profile/${user._id}` : "profile";
  const leavesPath = user?._id ? `leaves/${user._id}` : "leaves";
  const salaryPath = user?._id ? `salary/employee/${user._id}` : "salary";

  return (
    <PageLayout title={"Employee Dashboard"}>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        <Card
          name="Welcome Back"
          icon={User}
          value={overviewData.name || user?.name || "-"}
          color="oklch(71.5% 0.143 215.221)"
          to={profilePath}
          isLoading={loading}
        />
        <Card
          name="Department"
          icon={Building}
          value={loading ? "-" : overviewData.department}
          color="oklch(62.7% 0.265 303.9)"
          to={profilePath}
          isLoading={loading}
        />
        <Card
          name="Designation"
          icon={Briefcase}
          value={loading ? "-" : overviewData.designation}
          color="oklch(70.5% 0.213 47.604)"
          to={profilePath}
          isLoading={loading}
        />
        <Card
          name="Last Net Pay"
          icon={DollarSign}
          value={loading ? "-" : formatMoney(overviewData.latestNetSalary)}
          color="oklch(72.3% 0.219 149.579)"
          to={salaryPath}
          isLoading={loading}
        />
        <Card
          name="Leave Applied"
          icon={FileText}
          value={
            loading ? "-" : overviewData.leaveSummary.appliedFor
          }
          color="oklch(62.3% 0.214 259.815)"
          to={leavesPath}
          isLoading={loading}
        />
        <Card
          name="Leave Approved"
          icon={CheckCircle}
          value={
            loading ? "-" : overviewData.leaveSummary.approved
          }
          color="oklch(72.3% 0.219 149.579)"
          to={leavesPath}
          isLoading={loading}
        />
        <Card
          name="Leave Pending"
          icon={Clock}
          value={
            loading ? "-" : overviewData.leaveSummary.pending
          }
          color="oklch(79.5% 0.184 86.047)"
          to={leavesPath}
          isLoading={loading}
        />
        <Card
          name="Leave Rejected"
          icon={XCircle}
          value={
            loading ? "-" : overviewData.leaveSummary.rejected
          }
          color="oklch(63.7% 0.237 25.331)"
          to={leavesPath}
          isLoading={loading}
        />
        <Card
          name="Annual Remaining"
          icon={Calendar}
          value={
            loading ? "-" : overviewData.leaveBalance.annualLeave
          }
          color="oklch(58.5% 0.233 277.117)"
          to={leavesPath}
          isLoading={loading}
        />
        <Card
          name="Casual Remaining"
          icon={Sun}
          value={
            loading ? "-" : overviewData.leaveBalance.casualLeave
          }
          color="oklch(82.8% 0.189 84.429)"
          to={leavesPath}
          isLoading={loading}
        />
        <Card
          name="Medical Remaining"
          icon={Heart}
          value={
            loading ? "-" : overviewData.leaveBalance.medicalLeave
          }
          color="oklch(64.5% 0.246 16.439)"
          to={leavesPath}
          isLoading={loading}
        />
        <Card
          name="Parental Remaining"
          icon={Baby}
          value={
            loading ? "-" : overviewData.leaveBalance.maternityLeave
          }
          color="oklch(71.5% 0.143 215.221)"
          to={leavesPath}
          isLoading={loading}
        />
      </div>
    </PageLayout>
  );
});

export default EmployeeOverview;
