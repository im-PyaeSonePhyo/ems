import React, { useEffect, useState } from "react";
import PageLayout from "../layout/PageLayout";
import { observer } from "mobx-react-lite";
import { SearchInput } from "../common/Input";
import { Table } from "../common/Table";
import { ActionButton, SubmitLink } from "../common/Button";
import { useNavigate } from "react-router-dom";
import { departmentStore } from "../../stores/department.store";
import ConfirmDeleteModal from "../common/ConfirmDeleteModal";
import { DEPARTMENT_TABLE_HEADER } from "../constants/Constants";
import { Users } from "lucide-react";

const DepartmentList = observer(() => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);

  const { departments, loading, fetchDepartments, deleteDepartment } =
    departmentStore;
  const navigate = useNavigate();

  useEffect(() => {
    fetchDepartments();
  }, []);

  const filteredDepartments = (departments || []).filter((dep) =>
    dep.dep_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const confirmDelete = (department) => {
    setSelectedDepartment(department);
    setShowModal(true);
  };

  const handleDeleteConfirmed = async () => {
    if (!selectedDepartment) return;
    const success = await deleteDepartment(selectedDepartment._id);
    if (success) {
      setShowModal(false);
      setSelectedDepartment(null);
    }
  };

  const handleViewEmployees = () => {
    const departmentName = selectedDepartment?.dep_name;
    setShowModal(false);
    setSelectedDepartment(null);
    navigate("../employees", {
      state: { departmentFilter: departmentName },
    });
  };

  const employeeCount = selectedDepartment?.employeeCount ?? 0;
  const hasEmployees = employeeCount > 0;
  const employeeLabel =
    employeeCount === 1 ? "assigned employee" : "assigned employees";
  const departmentName = selectedDepartment?.dep_name || "this department";

  return (
    <PageLayout title="Department List" maxWidth={"max-w-6xl"}>
      <div className="flex flex-wrap gap-4 justify-between items-center mb-6 w-full">
        <SearchInput
          placeholder="Search Department..."
          handleChange={(e) => setSearchTerm(e.target.value)}
          value={searchTerm}
          isLoading={loading}
        />
        <SubmitLink urlLink="../add-department" name="Add Department" />
      </div>
      <Table
        headings={DEPARTMENT_TABLE_HEADER}
        data={filteredDepartments}
        isLoading={loading}
        isSerialNo={true}
        renderRow={(item) => (
          <>
            <td className="px-6 py-4 whitespace-nowrap text-m">{item.dep_name}</td>
            <td className="px-6 py-4 whitespace-nowrap space-x-3">
              <ActionButton
                onClick={() => navigate(`../department/${item._id}`)}
                name="Edit"
                className="bg-yellow-600 hover:bg-yellow-700"
              />
              <ActionButton
                onClick={() => confirmDelete(item)}
                name="Delete"
                className="bg-red-600 hover:bg-red-700"
              />
            </td>
          </>
        )}
      />

      <ConfirmDeleteModal
        show={showModal}
        variant={hasEmployees ? "blocked" : "confirm"}
        entityLabel="Department"
        title={
          hasEmployees ? "Cannot Delete Department" : "Delete Department?"
        }
        description={
          hasEmployees ? (
            <>
              <span className="font-semibold text-white">{departmentName}</span>{" "}
              has{" "}
              <span className="font-semibold text-white">
                {employeeCount} {employeeLabel}
              </span>
              . Departments with assigned employees cannot be deleted.
            </>
          ) : (
            <>
              Are you sure you want to delete{" "}
              <span className="font-semibold text-white">{departmentName}</span>
              ? This department has no assigned employees and can be removed.
            </>
          )
        }
        hint={
          hasEmployees
            ? "Move these employees to another department first, then try again."
            : "This cannot be undone."
        }
        confirmLabel="Delete Department"
        actionLabel="View Employees"
        actionIcon={Users}
        onAction={handleViewEmployees}
        onConfirm={handleDeleteConfirmed}
        onClose={() => {
          setShowModal(false);
          setSelectedDepartment(null);
        }}
      />
    </PageLayout>
  );
});

export default DepartmentList;
