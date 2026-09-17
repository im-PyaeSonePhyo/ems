import React, { useState, useEffect } from 'react';
import PageLayout from '../layout/PageLayout';
import { ActionButton, SubmitLink } from '../common/Button';
import { Table } from '../common/Table';
import { SAME_MONTH_SALARY_LIST_HEADER } from '../constants/Constants';
import { salaryStore } from '../../stores/salary.store';
import { observer } from 'mobx-react-lite';
import { useNavigate } from 'react-router-dom';
import ConfirmDeleteModal from '../common/ConfirmDeleteModal';

const SalaryCollectionList = observer(() => {
  const {
    loading,
    salaryCollections,
    fetchSalaryCollections,
    deleteSalariesByPayDate,
  } = salaryStore;

  const [showModal, setShowModal] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSalaryCollections();
  }, []);

  const confirmDelete = (collection) => {
    setSelectedCollection(collection);
    setShowModal(true);
  };

  const handleDeleteConfirmed = async () => {
    if (!selectedCollection) return;

    const success = await deleteSalariesByPayDate(selectedCollection._id); // _id is payDate
    if (success) {
      await fetchSalaryCollections();
      setShowModal(false);
      setSelectedCollection(null);
    }
  };

  return (
    <PageLayout title="Salary List">
      <div className="flex justify-end items-center mb-6">
        <SubmitLink urlLink="../salary/add" name="Add Salary" />
      </div>

      <Table
        headings={SAME_MONTH_SALARY_LIST_HEADER}
        data={salaryCollections}
        isLoading={loading}
        isSerialNo={true}
        renderRow={(item) => (
          <>
            <td className="px-6 py-4 whitespace-nowrap">{item.totalEmployees}</td>
            <td className="px-6 py-4 whitespace-nowrap">{item.totalNetSalary}</td>
            <td className="px-6 py-4 whitespace-nowrap">
              {new Date(item._id).toLocaleDateString()}
            </td>
            <td className="px-6 py-4 whitespace-nowrap space-x-3">
              <ActionButton
                onClick={() => navigate(`../salary/collections/${item._id}`)}
                name="View"
                className="bg-green-600 hover:bg-green-700"
              />
              <ActionButton
                onClick={() => navigate(`../salary/edit/${item._id}`)}
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
        entityLabel="Salary"
        title="Delete Salary Records?"
        description={
          <>
            Are you sure you want to delete salary records for{" "}
            <span className="font-semibold text-white">
              {selectedCollection
                ? new Date(selectedCollection._id).toLocaleDateString()
                : "this pay date"}
            </span>
            ?
          </>
        }
        hint="All salary entries for this pay date will be removed. This cannot be undone."
        confirmLabel="Delete Salary"
        onClose={() => {
          setShowModal(false);
          setSelectedCollection(null);
        }}
        onConfirm={handleDeleteConfirmed}
      />
    </PageLayout>
  );
});

export default SalaryCollectionList;
