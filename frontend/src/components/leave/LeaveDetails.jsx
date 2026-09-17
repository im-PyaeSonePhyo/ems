import { observer } from "mobx-react-lite";
import React, { useEffect } from "react";
import PageLayout from "../layout/PageLayout";
import { leaveStore } from "../../stores/leave.store";
import { useNavigate, useParams } from "react-router-dom";
import { ActionButton } from "../common/Button";
import { DetailSkeleton } from "../common/Skeleton";
import { departmentLabel } from "../../utils/employeeDepartments";
import { employeeStore } from "../../stores/employee.store";
import AuthImage from "../common/AuthImage";

const LeaveDetails = observer(() => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { leave, loading, changeStatus, fetchLeave } = leaveStore;
  const { fetchEmployee, employee } = employeeStore;

  useEffect(() => {
    fetchLeave(id);
  }, [id]);

  useEffect(() => {
    if(leave?.employeeId){
    if(typeof leave?.employeeId === "object"){
    fetchEmployee(leave?.employeeId?.userId?._id)
    }else{
      fetchEmployee(leave?.employeeId)
    }
  }
  },[leave])

  const leaveDetails = [
    {
      label: "Name:",
      value: employee?.userId?.name,
    },
    {
      label: "Employee ID:",
      value: employee?.employeeId,
    },
    {
      label: "Leave Type:",
      value: leave?.leaveType,
    },
    {
      label: "Reason:",
      value: leave?.description,
    },
    {
      label: "Department:",
      value: departmentLabel(employee),
    },
    {
      label: "Start Date:",
      value: leave?.startDate
        ? new Date(leave.startDate).toLocaleDateString()
        : "",
    },
    {
      label: "End Date:",
      value: leave?.endDate ? new Date(leave.endDate).toLocaleDateString() : "",
    },
  ];

  return (
    <PageLayout title={"Leave Details"} maxWidth={"max-w-4xl"}>
      {!loading && leave?._id ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative w-72 h-72 rounded-full overflow-hidden border">
            <AuthImage
              filename={leave?.employeeId?.userId?.profileImage}
              alt={leave?.employeeId?.userId?.name}
              className="w-full h-full object-cover"
            />
          </div>
          {/* Leave Details */}
          <div className="ml-6 text-gray-300 space-y-4">
            {leaveDetails.map((item, index) => (
              <div key={index} className="flex items-start gap-2">
                <span className="w-32 font-medium text-gray-400">{item.label}</span>
                <span className="text-gray-100">
                  {item.value}
                </span>
              </div>
            ))}

            {/* Leave Status Update */}
            <div className="flex items-start gap-2 pt-4 border-t border-gray-700 mt-4">
              <span className="w-32 font-medium text-gray-400">
                {leave.status === "Pending" ? "Action" : "Status:"}
              </span>
              <span className="text-gray-100">
                {leave.status === "Pending" ? (
                  <div className="flex gap-3">
                    <ActionButton
                      name={"Approve"}
                      loading={loading}
                      disabled={loading}
                      onClick={() => changeStatus(leave._id, "Approved", navigate)}
                      className={"bg-green-600 hover:bg-green-700 mr-5"}
                    />
                    <ActionButton
                      name={"Reject"}
                      loading={loading}
                      disabled={loading}
                      onClick={() => changeStatus(leave._id, "Rejected", navigate)}
                      className={"bg-red-600 hover:bg-red-700"}
                    />
                  </div>
                ) : (
                  <p
                    className={`font-semibold ${
                      leave.status === "Pending"
                        ? "text-yellow-500"
                        : leave.status === "Approved"
                        ? "text-green-500"
                        : leave.status === "Rejected"
                        ? "text-red-500"
                        : ""
                    }`}
                  >
                    {leave.status}
                  </p>
                )}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <DetailSkeleton />
      )}
    </PageLayout>
  );
});

export default LeaveDetails;
