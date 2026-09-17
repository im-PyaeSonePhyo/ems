import { observer } from "mobx-react-lite";
import React, { useEffect, useState } from "react";
import PageLayout from "../layout/PageLayout";
import { salaryStore } from "../../stores/salary.store";
import { Input } from "../common/Input";
import { CancelButton, SubmitButton } from "../common/Button";
import { Datepicker } from "flowbite-react";
import { employeeStore } from "../../stores/employee.store";
import {
  SALARY_DEFAULT_LABEL,
  SALARY_INPUT_FIELDS,
  ADD_SALARY_HEADER,
} from "../constants/Constants";
import { useNavigate, useParams } from "react-router-dom";
import { TableSkeletonRows } from "../common/Skeleton";
import Loading from "../common/Loading";
import { FolderOpen } from "lucide-react";
import { motion } from "framer-motion";

const SalaryForm = observer(() => {
  const { payDate } = useParams();
  const isEditMode = Boolean(payDate);
  const [currentPage, setCurrentPage] = useState(1);
  const dataPerPage = 10;

  const {
    loading,
    saving,
    formData,
    defaultAllowances,
    handleDefaultChange,
    handlePayDateChange,
    handleEmployeeSalaryChange,
    handleSubmit,
    fetchSalariesByPayDate,
    fetchSalaryCollections,
    resetForm,
    hasSalaryChanges,
  } = salaryStore;

  const { employeeList, fetchEmployees } = employeeStore;
  const navigate = useNavigate();

  const indexOfLastData = currentPage * dataPerPage;
  const indexOfFirstData = indexOfLastData - dataPerPage;
  const currentData = employeeList.slice(indexOfFirstData, indexOfLastData);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  useEffect(() => {
    salaryStore.saving = false;
    fetchEmployees();
    fetchSalaryCollections();
    if (isEditMode) {
      fetchSalariesByPayDate(payDate);
    } else {
      resetForm();
    }
  }, [payDate]);

  return (
    <PageLayout title={"Give Salaries to Employees"} maxWidth={"max-w-8xl"}>
      <form className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
          {SALARY_DEFAULT_LABEL.map(({ name, label }) => (
            <div key={name}>
              <Input
                name={name}
                title={label}
                type={"number"}
                value={defaultAllowances[name] ?? 0}
                handleChange={(e) => handleDefaultChange(name, e.target.value)}
              />
            </div>
          ))}
          <div>
            <label
              htmlFor="payDate"
              className="text-sm font-medium text-gray-600 block mb-1"
            >
              Pay Date
            </label>
            <div className="custom-datepicker">
              <Datepicker
                value={defaultAllowances.payDate}
                onChange={handlePayDateChange}
                name="payDate"
                disabled={isEditMode}
              />
            </div>
          </div>
        </div>

        {/* Employees Salary Table */}
        <div className="overflow-x-auto relative">
          <table className="min-w-full divide-y divide-gray-700">
            <thead>
              <tr>
                {ADD_SALARY_HEADER.map((heading, index) => (
                  <th
                    key={index}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider sticky top-0 z-10 bg-gray-800"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-700">
              {loading && employeeList.length === 0 ? (
                <TableSkeletonRows
                  columns={ADD_SALARY_HEADER.length}
                  rows={8}
                />
              ) : employeeList.length > 0 ? (
                currentData.map((item, index) => (
                  <motion.tr
                    key={item._id || index}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <td className="p-2 border-r border-gray-700 font-medium">
                      {item.employeeId}
                    </td>
                    <td className="p-2 border-r border-gray-700 font-medium">
                      {item.userId.name}
                    </td>
                    <td className="p-1 border-r border-gray-700">
                      <Input
                        name={"basicSalary"}
                        type="number"
                        value={item?.salary ?? 0}
                        disabled={true}
                      />
                    </td>
                    {SALARY_INPUT_FIELDS.map((field) => (
                      <td
                        key={field}
                        className="p-1 border-r border-gray-700"
                      >
                        <Input
                          name={field}
                          type="number"
                          value={formData?.[item._id]?.[field] ?? 0}
                          handleChange={(e) =>
                            handleEmployeeSalaryChange(
                              item._id,
                              field,
                              e.target.value
                            )
                          }
                          required={false}
                        />
                      </td>
                    ))}
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={ADD_SALARY_HEADER.length}
                    className="text-center text-gray-400 py-12 font-medium"
                  >
                    <div className="flex flex-col items-center">
                      <FolderOpen size={50} />
                      <span>No Records Found</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-gray-300">
              {indexOfFirstData + 1} to{" "}
              {Math.min(indexOfLastData, employeeList.length)} of{" "}
              {employeeList.length}
            </div>
            <div className="flex space-x-2">
              {Array.from(
                { length: Math.ceil(employeeList.length / dataPerPage) },
                (_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => paginate(i + 1)}
                    className={`px-3 py-1 rounded-md text-sm ${
                      currentPage === i + 1
                        ? "bg-indigo-600 text-white hover:bg-indigo-700"
                        : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    }`}
                  >
                    {i + 1}
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      </form>

      <div className="text-end">
        <CancelButton
          onClick={() => {
            resetForm();
            navigate(-1);
          }}
        />
        <SubmitButton
          onClick={handleSubmit(navigate, payDate)}
          name={isEditMode ? "Update Salary" : "Add Salary"}
          className={"bg-indigo-600 hover:bg-indigo-700 ml-5"}
          disabled={saving || (isEditMode && !hasSalaryChanges)}
        />
      </div>
      {saving && (
        <Loading
          fullScreen
          text={isEditMode ? "Updating salaries..." : "Adding salaries..."}
        />
      )}
    </PageLayout>
  );
});

export default SalaryForm;
