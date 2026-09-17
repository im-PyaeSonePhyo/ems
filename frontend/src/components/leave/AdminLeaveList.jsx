import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ActionButton } from "../common/Button";
import { Table } from "../common/Table";
import { observer } from "mobx-react-lite";
import PageLayout from "../layout/PageLayout";
import { leaveStore } from "../../stores/leave.store";
import { SearchInput } from "../common/Input";
import { CheckCircle, ClipboardList, Clock, XCircle } from "lucide-react";
import { ADMIN_LEAVE_LIST_HEADER } from "../constants/Constants";
import { departmentLabel } from "../../utils/employeeDepartments";

const STATUS_TABS = [
  {
    key: "All",
    label: "All Leaves",
    icon: ClipboardList,
    activeClass: "bg-indigo-600 text-white",
    iconClass: "text-indigo-500",
  },
  {
    key: "Approved",
    label: "Approved",
    icon: CheckCircle,
    activeClass: "bg-green-600 text-white",
    iconClass: "text-green-500",
  },
  {
    key: "Pending",
    label: "Pending",
    icon: Clock,
    activeClass: "bg-yellow-600 text-white",
    iconClass: "text-yellow-500",
  },
  {
    key: "Rejected",
    label: "Rejected",
    icon: XCircle,
    activeClass: "bg-red-600 text-white",
    iconClass: "text-red-500",
  },
];

const AdminLeaveList = observer(() => {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const { leaves, loading, activeStatus, filteredByStatus, fetchAdminLeaves } =
    leaveStore;

  useEffect(() => {
    fetchAdminLeaves();
  }, []);

  const getDays = (start, end, halfDay = { type: "none" }) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = endDate - startDate;
    const fullDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    const adjustedDays =
      halfDay && halfDay.type !== "none" ? fullDays - 0.5 : fullDays;

    return adjustedDays;
  };

  const handleFilter = (e) => {
    setSearchTerm(e.target.value);
  };

  const searchValue = searchTerm.toLowerCase();
  const displayedLeaves = leaves
    .filter((leave) => {
      if (!searchValue) return true;
      return (
        leave?.employeeId?.userId?.name?.toLowerCase().includes(searchValue) ||
        leave?.status?.toLowerCase().includes(searchValue)
      );
    })
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <PageLayout title={"Manage Leaves"}>
      <div className="flex flex-wrap gap-4 justify-between items-center mb-6 w-full">
        <SearchInput
          placeholder="Search Employee..."
          handleChange={handleFilter}
          value={searchTerm}
          isLoading={loading}
        />
        <div
          className="inline-flex rounded-lg overflow-hidden border border-gray-700 w-full sm:w-auto"
          role="group"
        >
          {STATUS_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeStatus === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => filteredByStatus(tab.key)}
                className={`flex flex-1 sm:flex-none items-center justify-center px-4 py-3 text-sm font-medium border-0 outline-none ring-0 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 ${
                  isActive
                    ? tab.activeClass
                    : "bg-gray-800 text-white hover:bg-gray-700"
                }`}
              >
                <Icon
                  size={20}
                  className={`mr-2 ${isActive ? "text-white" : tab.iconClass}`}
                />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
      <Table
        headings={ADMIN_LEAVE_LIST_HEADER}
        data={displayedLeaves}
        isLoading={loading}
        isSerialNo={true}
        renderRow={(item) => (
          <>
            <td className="px-6 py-4 whitespace-nowrap text-m text-gray-300">
              {item.employeeId.employeeId}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-m text-gray-300">
              {item?.employeeId?.userId?.name}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-m text-gray-300">
              {item.leaveType}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-m text-gray-300">
              {departmentLabel(item?.employeeId)}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-m text-gray-300">
              {getDays(item.startDate, item.endDate, item.halfDay)}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-gray-300">
              <div
                className={`text-m ${
                  item.status === "Pending"
                    ? "text-yellow-500"
                    : item.status === "Approved"
                    ? "text-green-500"
                    : "text-red-500"
                }`}
              >
                {item.status}
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-gray-300">
              <ActionButton
                onClick={() => navigate(`../leaves/details/${item._id}`)}
                name={"View"}
                className={"bg-indigo-600 hover:bg-indigo-700"}
                isLoading={loading}
              />
            </td>
          </>
        )}
      />
    </PageLayout>
  );
});

export default AdminLeaveList;
