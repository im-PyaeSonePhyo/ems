import { observer } from "mobx-react-lite";
import React, { useEffect } from "react";
import { employeeStore } from "../../stores/employee.store";
import { departmentStore } from "../../stores/department.store";
import { useNavigate, useParams } from "react-router-dom";
import { EMPLOYEE_TYPE, MARITAL_STATUS_OPTIONS } from "../constants/Constants";
import { motion } from "framer-motion";
import { Input, MultiSelect, Select } from "../common/Input";
import PageLayout from "../layout/PageLayout";
import { CancelButton, SubmitButton } from "../common/Button";
import { FormSkeleton } from "../common/Skeleton";
import { CirclePlus, Plus, Trash2 } from "lucide-react";
import { toJS } from "mobx";

const UpdateEmployee = observer(() => {
  const {
    employee,
    updateData,
    fetchEmployee,
    handleUpdateChange,
    handleUpdateDepartmentsChange,
    updateEmployee,
    handleUpdateDurationChange,
    handleUpdatePhoneChange,
    removeUpdatePhoneRow,
    addUpdatePhoneRow,
    errorMessage,
    hasEmployeeChanges,
    fetchEmployees,
  } = employeeStore;
  const { departments, fetchDepartments } = departmentStore;
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    fetchDepartments();
    fetchEmployees();
    fetchEmployee(id);
  }, [id]);

  const departmentOptions = departments?.map((dep) => ({
    label: dep.dep_name,
    value: dep._id,
  }));

  return (
    <>
      {departments && employee ? (
        <PageLayout title="Update Employee">
          <div className="items-center mb-6">
            <form className="relative">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  name={"name"}
                  title={"Name"}
                  type={"text"}
                  placeholder={"Enter Employee Name"}
                  value={updateData.name}
                  handleChange={handleUpdateChange}
                  required={true}
                  error={errorMessage?.name}
                />
                <Input
                  name={"email"}
                  title={"Email"}
                  type={"email"}
                  placeholder={"Enter Email"}
                  value={updateData.email}
                  handleChange={handleUpdateChange}
                  required={true}
                  error={errorMessage?.email}
                />
                <Input
                  name={"current_address"}
                  title={"Current Address"}
                  type={"text"}
                  placeholder={"Enter Current Address"}
                  value={updateData.current_address ?? ""}
                  handleChange={handleUpdateChange}
                  required={true}
                  error={errorMessage?.current_address}
                />
                <Input
                  name={"permanent_address"}
                  title={"Permanent Address"}
                  type={"text"}
                  placeholder={"Enter Permanent Address"}
                  value={updateData.permanent_address ?? ""}
                  handleChange={handleUpdateChange}
                  required={true}
                  error={errorMessage?.permanent_address}
                />
                {/* Dynamic Phones Section */}
                <div className="col-span-1 md:col-span-3 my-3">
                  <label className="block text-md font-semibold text-gray-300">
                    Phone Numbers
                  </label>
                  {updateData.phones &&
                    updateData.phones.map((phone, idx) => (
                      <div
                        key={idx}
                        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 my-2 items-center"
                      >
                        {/* Type */}
                        <Input
                          name={`update_phone_type_${idx}`}
                          title={"Type"}
                          type={"text"}
                          placeholder={
                            "Phone Type (e.g. Personal, Emergency, Mother)"
                          }
                          value={phone.type}
                          handleChange={(e) =>
                            handleUpdatePhoneChange(idx, "type", e.target.value)
                          }
                          required={true}
                        />
                        {/* Number */}
                        <Input
                          name={`update_phone_number_${idx}`}
                          title={"Number"}
                          type={"text"}
                          placeholder={"Phone Number"}
                          value={phone.number}
                          handleChange={(e) =>
                            handleUpdatePhoneChange(
                              idx,
                              "number",
                              e.target.value.replace(/\D/g, "")
                            )
                          }
                          required={true}
                          min={0}
                        />
                        {/* Note */}
                        <Input
                          name={`update_phone_note_${idx}`}
                          title={"Note"}
                          type={"text"}
                          placeholder={"Note (e.g. Mother)"}
                          value={phone.note || ""}
                          handleChange={(e) =>
                            handleUpdatePhoneChange(idx, "note", e.target.value)
                          }
                        />
                        <div className="flex justify-items-start space-x-6 mt-5">
                          <button
                            type="button"
                            className="cursor-pointer"
                            onClick={() => {
                              if (updateData.phones.length === 1) {
                                handleUpdatePhoneChange(idx, "type", "");
                                handleUpdatePhoneChange(idx, "number", "");
                                handleUpdatePhoneChange(idx, "note", "");
                              } else {
                                removeUpdatePhoneRow(idx);
                              }
                            }}
                          >
                            <Trash2
                              size={24}
                              className="text-red-800 hover:text-red-900 transition"
                            />{" "}
                          </button>
                          {idx === updateData.phones.length - 1 && (
                            <button
                              type="button"
                              className="cursor-pointer"
                              onClick={addUpdatePhoneRow}
                            >
                              <CirclePlus
                                size={24}
                                className="text-green-800 hover:text-green-900 transition"
                              />{" "}
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
                <Select
                  name={"maritalStatus"}
                  title={"Marital Status"}
                  valueCheck={updateData.maritalStatus}
                  options={MARITAL_STATUS_OPTIONS}
                  handleChange={handleUpdateChange}
                  required={true}
                  error={errorMessage?.maritalStatus}
                />
                <Input
                  name={"designation"}
                  title={"Designation"}
                  type={"text"}
                  placeholder={"Enter Designation"}
                  value={updateData.designation}
                  handleChange={handleUpdateChange}
                  required={true}
                  error={errorMessage?.designation}
                />
                <MultiSelect
                  name={"departments"}
                  title={"Department"}
                  values={updateData.departments ?? []}
                  options={departmentOptions}
                  handleChange={handleUpdateDepartmentsChange}
                  required={true}
                  error={errorMessage?.department}
                />
                <Select
                  name={"employeeType"}
                  title={"Employee Type"}
                  valueCheck={updateData.employeeType ?? ""}
                  options={EMPLOYEE_TYPE}
                  handleChange={handleUpdateChange}
                  required={true}
                  error={errorMessage?.employeeType}
                />
                {updateData.employeeType !== "Permanent" && (
                  <Input
                    name={"duration"}
                    title={"Duration"}
                    type={"number"}
                    placeholder={"Enter Duration"}
                    value={updateData.duration ?? 0}
                    handleChange={handleUpdateDurationChange}
                    required={true}
                    error={errorMessage?.duration}
                  />
                )}
                {updateData.employeeType !== "Internship" && (
                  <Input
                    name={"salary"}
                    title={"Salary"}
                    type={"number"}
                    placeholder={"Enter Salary"}
                    value={updateData.salary}
                    handleChange={handleUpdateChange}
                    required={true}
                    error={errorMessage?.salary}
                  />
                )}
                {updateData.employeeType === "Permanent" && (
                  <>
                    <Input
                      name={"annualLeave"}
                      title={"Annual Leave"}
                      type={"number"}
                      placeholder={"Enter Annual Leave"}
                      value={updateData.annualLeave ?? ""}
                      handleChange={handleUpdateChange}
                      required={true}
                      error={errorMessage?.annualLeave}
                    />
                    <Input
                      name={"casualLeave"}
                      title={"Casual Leave"}
                      type={"number"}
                      placeholder={"Enter Casual Leave"}
                      value={updateData.casualLeave ?? ""}
                      handleChange={handleUpdateChange}
                      required={true}
                      error={errorMessage?.casualLeave}
                    />
                    <Input
                      name={"medicalLeave"}
                      title={"Medical Leave"}
                      type={"number"}
                      placeholder={"Enter Medical Leave"}
                      value={updateData.medicalLeave ?? ""}
                      handleChange={handleUpdateChange}
                      required={true}
                      error={errorMessage?.medicalLeave}
                    />
                    <Input
                      name={"maternityLeave"}
                      title={"Maternity, and Paternity Leave"}
                      type={"number"}
                      placeholder={"Enter Maternity, and Paternity Leave"}
                      value={updateData.maternityLeave ?? ""}
                      handleChange={handleUpdateChange}
                      required={true}
                      error={errorMessage?.maternityLeave}
                    />
                  </>
                )}
              </div>
            </form>
              <div className="text-end">
                <CancelButton
                  onClick={() => {
                    navigate(-1);
                  }}
                />
                <SubmitButton
                  className="bg-indigo-600 hover:bg-indigo-700 ml-5"
                  name="Update Employee"
                  disabled={!hasEmployeeChanges}
                  onClick={updateEmployee(id, "updateEmp", navigate)}
                />
              </div>
          </div>
        </PageLayout>
      ) : (
        <PageLayout title="Update Employee">
          <FormSkeleton fields={12} columns={3} />
        </PageLayout>
      )}
    </>
  );
});

export default UpdateEmployee;
