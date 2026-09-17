import { observer } from "mobx-react-lite";
import React, { useEffect, useState } from "react";
import { departmentStore } from "../../stores/department.store";
import {
  EMPLOYEE_TYPE,
  GENDER_OPTIONS,
  MARITAL_STATUS_OPTIONS,
} from "../constants/Constants";
import PageLayout from "../layout/PageLayout";
import { Input, MultiSelect, Select } from "../common/Input";
import { Datepicker, FileInput } from "flowbite-react";
import { CancelButton, SubmitButton } from "../common/Button";
import { useNavigate } from "react-router-dom";
import { employeeStore } from "../../stores/employee.store";
import { CirclePlus, Trash2 } from "lucide-react";

const AddEmployee = observer(() => {
  const {
    employeeList,
    formData,
    showLeaves,
    showDuration,
    showSalary,
    errorMessage,
    createEmployeeId,
    handleChange,
    handleDepartmentsChange,
    handleDateChange,
    handleDurationChange,
    handleSubmit,
    resetFormData,
    resetErrorMessage,
    fetchEmployees,
    addPhoneRow,
    handlePhoneChange,
    removePhoneRow,
  } = employeeStore;
  const { departments, fetchDepartments } = departmentStore;
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    createEmployeeId();
  }, [employeeList]);

  useEffect(() => {
    fetchDepartments();
    fetchEmployees();
  }, []);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const departmentOptions = departments.map((dep) => ({
    label: dep.dep_name,
    value: dep._id,
  }));

  const today = new Date();
  const maxDate = new Date(
    today.getFullYear() - 16,
    today.getMonth(),
    today.getDate()
  );

  return (
    <PageLayout title={"Add New Employee"}>
      <div className="items-center mb-4">
        <form className="relative">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              name={"employeeId"}
              title={"Employee Id"}
              type={"text"}
              placeholder={"Enter Employee Id"}
              value={formData.employeeId ?? ""}
              handleChange={handleChange}
              required={true}
              error={errorMessage?.employeeId}
              disabled={true}
            />
            <Input
              name={"name"}
              title={"Name"}
              type={"text"}
              placeholder={"Enter Employee Name"}
              value={formData.name ?? ""}
              handleChange={handleChange}
              required={true}
              error={errorMessage?.name}
            />
            <Input
              name={"current_address"}
              title={"Current Address"}
              type={"text"}
              placeholder={"Enter Current Address"}
              value={formData.current_address ?? ""}
              handleChange={handleChange}
              required={true}
              error={errorMessage?.current_address}
            />
            <Input
              name={"permanent_address"}
              title={"Permanent Address"}
              type={"text"}
              placeholder={"Enter Permanent Address"}
              value={formData.permanent_address ?? ""}
              handleChange={handleChange}
              required={true}
              error={errorMessage?.permanent_address}
            />
            <Input
              name={"nrc"}
              title={"National Register of Citizens"}
              placeholder={"Enter National Register of Citizens"}
              value={formData.nrc ?? ""}
              handleChange={handleChange}
              required={true}
              error={errorMessage?.nrc}
            />
            {/* ...address fields replaced above... */}
            <Select
              name={"maritalStatus"}
              title={"Marital Status"}
              valueCheck={formData.maritalStatus ?? ""}
              options={MARITAL_STATUS_OPTIONS}
              handleChange={handleChange}
              required={true}
              error={errorMessage?.maritalStatus}
            />
            <div>
              <label
                htmlFor="dob"
                className="text-sm font-medium text-gray-600 block mb-1"
              >
                Date of Birth <span className="text-red-500">*</span>
              </label>
              <div className="custom-datepicker">
                <Datepicker
                  value={formData.dob ?? null}
                  onChange={(date) => handleDateChange("dob", date)}
                  name="dob"
                  maxDate={maxDate}
                  placeholder="Select Date of Birth"
                  label=""
                />
              </div>
              <span className="text-red-500 font-small">
                {errorMessage?.dob}
              </span>
            </div>
            <Select
              name={"gender"}
              title={"Gender"}
              valueCheck={formData.gender ?? ""}
              options={GENDER_OPTIONS}
              handleChange={handleChange}
              required={true}
              error={errorMessage?.gender}
            />
            <Input
              name={"email"}
              title={"Email"}
              type={"email"}
              placeholder={"Enter Email"}
              value={formData.email ?? ""}
              handleChange={handleChange}
              required={true}
              error={errorMessage?.email}
            />
            <Input
              name={"password"}
              title={"Password"}
              type={showPassword ? "text" : "password"}
              placeholder={"Enter Password"}
              value={formData.password ?? ""}
              handleChange={handleChange}
              required={true}
              togglePasswordVisibility={togglePasswordVisibility}
              error={errorMessage?.password}
            />
            {/* Dynamic Phones Section */}
            <div className="col-span-1 md:col-span-3 my-3">
              <label className="block text-md font-semibold text-gray-300">
                Phone Numbers
              </label>
              {errorMessage?.phones && (
                <p className="mt-1 text-sm text-red-500">{errorMessage.phones}</p>
              )}

              {formData.phones &&
                formData.phones.map((phone, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 my-2 items-center"
                  >
                    {/* Type */}
                    <Input
                      name={`phone_type_${idx}`}
                      title={"Phone Type"}
                      type={"text"}
                      placeholder={
                        "(e.g. Personal, Emergency)"
                      }
                      value={phone.type}
                      handleChange={(e) =>
                        handlePhoneChange(idx, "type", e.target.value)
                      }
                      required={true}
                    />

                    {/* Number */}
                    <Input
                      name={`phone_number_${idx}`}
                      title={"Number"}
                      type={"text"}
                      placeholder={"Phone Number"}
                      value={phone.number}
                      handleChange={(e) =>
                        handlePhoneChange(
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
                      name={`phone_note_${idx}`}
                      title={"Note"}
                      type={"text"}
                      placeholder={"(e.g. Mother)"}
                      value={phone.note || ""}
                      handleChange={(e) =>
                        handlePhoneChange(idx, "note", e.target.value)
                      }
                    />
                    <div className="flex justify-items-start space-x-6 mt-5">
                      <button
                        type="button"
                        className="cursor-pointer"
                        onClick={() => {
                          if (formData.phones.length === 1) {
                            handlePhoneChange(idx, "type", "");
                            handlePhoneChange(idx, "number", "");
                            handlePhoneChange(idx, "note", "");
                          } else {
                            removePhoneRow(idx);
                          }
                        }}
                      >
                        <Trash2
                          size={24}
                          className="text-red-800 hover:text-red-900 transition"
                        />
                      </button>
                      {idx === formData.phones.length - 1 && (
                        <button type="button" onClick={addPhoneRow} className="cursor-pointer">
                          <CirclePlus
                            size={24}
                            className="text-green-800 hover:text-green-900 transition"
                          />
                        </button>
                      )}
                    </div>

                    {errorMessage?.[`phones_${idx}`] && (
                      <div className="col-span-1 sm:col-span-2 md:col-span-4">
                        <p className="mt-1 text-sm text-red-500">
                          {errorMessage[`phones_${idx}`]}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
            </div>
            <Select
              name={"employeeType"}
              title={"Employee Type"}
              valueCheck={formData.employeeType ?? ""}
              options={EMPLOYEE_TYPE}
              handleChange={handleChange}
              required={true}
              error={errorMessage?.employeeType}
            />
            <div>
              <label
                htmlFor="workStartDay"
                className="text-sm font-medium text-gray-600 block mb-1"
              >
                Work Start Day <span className="text-red-500">*</span>
              </label>
              <div className="custom-datepicker">
                <Datepicker
                  value={formData.workStartDay ?? null}
                  onChange={(date) => handleDateChange("workStartDay", date)}
                  name="workStartDay"
                  placeholder="Select Work Start Day"
                  label=""
                />
              </div>
              <span className="text-red-500 font-small">
                {errorMessage?.workStartDay}
              </span>
            </div>
            {showDuration && (
              <Input
                name={"duration"}
                title={"Duration Month"}
                type={"number"}
                placeholder={"Enter Duration Month"}
                value={formData.duration ?? 0}
                handleChange={handleDurationChange}
                required={true}
                error={errorMessage?.duration}
                max={3}
                min={0}
              />
            )}
            <MultiSelect
              name={"departments"}
              title={"Department"}
              values={formData.departments ?? []}
              options={departmentOptions}
              handleChange={handleDepartmentsChange}
              required={true}
              error={errorMessage?.department}
            />
            <Input
              name={"designation"}
              title={"Designation"}
              type={"text"}
              placeholder={"Enter Designation"}
              value={formData.designation ?? ""}
              handleChange={handleChange}
              required={true}
              error={errorMessage?.designation}
            />
            {showSalary && (
              <Input
                name={"salary"}
                title={"Salary"}
                type={"number"}
                placeholder={"Enter Salary"}
                value={formData.salary ?? ""}
                handleChange={handleChange}
                required={true}
                error={errorMessage?.salary}
              />
            )}
            <div>
              <label
                htmlFor="image"
                className="text-sm font-medium text-gray-600"
              >
                Upload Image
              </label>
              <FileInput
                id="large-file-upload"
                className="custom-file-input mt-1 text-base file:text-base"
                name="image"
                accept="image/*"
                onChange={handleChange}
              />
              {errorMessage?.image && (
                <span className="text-red-500 font-small">
                  {errorMessage.image}
                </span>
              )}
            </div>

            {/* leave types */}
            {showLeaves && (
              <>
                <Input
                  name={"annualLeave"}
                  title={"Annual Leave"}
                  type={"number"}
                  placeholder={"Enter Annual Leave"}
                  value={formData.annualLeave ?? ""}
                  handleChange={handleChange}
                  required={false}
                  error={errorMessage?.annualLeave}
                />
                <Input
                  name={"casualLeave"}
                  title={"Casual Leave"}
                  type={"number"}
                  placeholder={"Enter Casual Leave"}
                  value={formData.casualLeave ?? ""}
                  handleChange={handleChange}
                  required={false}
                  error={errorMessage?.casualLeave}
                />
                <Input
                  name={"medicalLeave"}
                  title={"Medical Leave"}
                  type={"number"}
                  placeholder={"Enter Medical Leave"}
                  value={formData.medicalLeave ?? ""}
                  handleChange={handleChange}
                  required={false}
                  error={errorMessage?.medicalLeave}
                />
                <Input
                  name={"maternityLeave"}
                  title={"Maternity, and Paternity Leave"}
                  type={"number"}
                  placeholder={"Enter Maternity, and Paternity Leave"}
                  value={formData.maternityLeave ?? ""}
                  handleChange={handleChange}
                  required={false}
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
              resetFormData();
              resetErrorMessage();
            }}
          />
          <SubmitButton
            className="bg-indigo-600 hover:bg-indigo-700 ml-5"
            name="Add Employee"
            onClick={handleSubmit(navigate)}
          />
        </div>
      </div>
    </PageLayout>
  );
});

export default AddEmployee;
