import { useState } from "react";

export interface TableModals<T> {
  // Data for each modal
  viewData?: T;
  editData?: T;
  deleteData?: T;

  // State controls
  modals: {
    view: boolean;
    edit: boolean;
    delete: boolean;
  };

  // Setters for modal open/close
  setModal: {
    view: React.Dispatch<React.SetStateAction<boolean>>;
    edit: React.Dispatch<React.SetStateAction<boolean>>;
    delete: React.Dispatch<React.SetStateAction<boolean>>;
  };

  // Action handlers
  handleView: (rowData: T) => void;
  handleEdit: (rowData: T) => void;
  handleDelete: (rowData: T) => void;

  // Reset everything
  resetModals: () => void;
}

export function useTableModals<T>(): TableModals<T> {
  const [viewData, setViewData] = useState<T | undefined>();
  const [editData, setEditData] = useState<T | undefined>();
  const [deleteData, setDeleteData] = useState<T | undefined>();

  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const handleView = (rowData: T) => {
    setViewData(rowData);
    setIsViewOpen(true);
  };

  const handleEdit = (rowData: T) => {
    setEditData(rowData);
    setIsEditOpen(true);
  };

  const handleDelete = (rowData: T) => {
    setDeleteData(rowData);
    setIsDeleteOpen(true);
  };

  const resetModals = () => {
    setViewData(undefined);
    setEditData(undefined);
    setDeleteData(undefined);
    setIsViewOpen(false);
    setIsEditOpen(false);
    setIsDeleteOpen(false);
  };

  return {
    viewData,
    editData,
    deleteData,
    modals: {
      view: isViewOpen,
      edit: isEditOpen,
      delete: isDeleteOpen,
    },
    setModal: {
      view: setIsViewOpen,
      edit: setIsEditOpen,
      delete: setIsDeleteOpen,
    },
    handleView,
    handleEdit,
    handleDelete,
    resetModals,
  };
}
