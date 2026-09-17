import React, { useEffect } from "react";
import { observer } from "mobx-react-lite";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/authContext";
import { Select, Textarea } from "../common/Input";
import { Checkbox, Datepicker } from "flowbite-react";
import { CancelButton, SubmitButton } from "../common/Button";
import PageLayout from "../layout/PageLayout";
import { leaveStore } from "../../stores/leave.store";
import { HALF_DAY_OPTIONS, LEAVE_TYPE_OPTIONS } from "../constants/Constants";
import { FormSkeleton } from "../common/Skeleton";

const LeaveForm = observer(() => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const {
    loading,
    formData,
    errorMessage,
    fetchLeave,
    handleDate,
    setUserId,
    resetForm,
    createLeave,
    handleChange,
    updateLeave,
  } = leaveStore;

  useEffect(() => {
    if (user?._id) setUserId(user._id);
        
    if (isEditMode) {
      fetchLeave(id)
    } else {
      resetForm();
    }
  }, [user, id]);

  const showSkeleton = isEditMode && loading && !formData.leaveType;

  return (
    <PageLayout
      title={isEditMode ? "Edit Leave" : "Request Leave"}
      maxWidth={"max-w-3xl"}
    >
      {showSkeleton ? (
        <FormSkeleton fields={5} columns={1} />
      ) : (
      <form>
        <Select
          name="leaveType"
          title="Leave Type"
          valueCheck={formData.leaveType}
          options={LEAVE_TYPE_OPTIONS}
          handleChange={handleChange}
          required
          isLoading={loading}
          error={errorMessage.leaveType}
        />

        <div className="mt-3">
          <label className="text-sm font-medium text-gray-600 block mb-1">
            From Date
          </label>
          <div className="custom-datepicker">
            <Datepicker
              value={formData.startDate || new Date()}
              onChange={(e) => handleDate("startDate", e)}
              minDate={new Date()}
              name="startDate"
            />
          </div>
        </div>

        <div className="mt-3">
          <label className="text-sm font-medium text-gray-600 block mb-1">
            End Date
          </label>
          <div className="custom-datepicker">
            <Datepicker
              value={formData.endDate || new Date()}
              onChange={(e) => handleDate("endDate", e)}
              minDate={new Date()}
              name="endDate"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 mt-4 mb-3">
          <Checkbox
            id="isHalfDay"
            name="isHalfDay"
            checked={formData.isHalfDay}
            onChange={handleChange}
          />
          <label htmlFor="isHalfDay" className="text-gray-600">
            Half Day
          </label>
        </div>

        {formData.isHalfDay && (
          <Select
            name="halfDayType"
            title="Half Day Type"
            handleChange={handleChange}
            valueCheck={formData.halfDayType}
            options={HALF_DAY_OPTIONS}
            isLoading={loading}
          />
        )}
        <Textarea
          name="description"
          title="Reason"
          value={formData.description}
          placeholder="Enter Reason"
          handleChange={handleChange}
          required={true}
          error={errorMessage.description}
          isLoading={loading}
        />
      </form>
      )}
      {!showSkeleton && (
      <div className="text-end">
        <CancelButton
          loading={loading}
          onClick={() => {
            resetForm();
            navigate(-1);
          }}
        />
        <SubmitButton
          onClick={
            isEditMode
              ? (e) => updateLeave(id, navigate)(e)
              : createLeave(navigate)
          }
          name={isEditMode ? "Update Leave" : "Add Leave"}
          className={"bg-indigo-600 hover:bg-indigo-700 ml-5"}
          loading={loading}
        />
      </div>
      )}
    </PageLayout>
  );
});

export default LeaveForm;
