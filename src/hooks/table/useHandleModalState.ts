import { useState } from "react";

type ModalType = "view" | "edit" | "delete" | null;

export function useHandleModalState<T>() {
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [modalData, setModalData] = useState<T | undefined>(undefined);

  const handleOpen = (type: ModalType, data?: T) => {
    setModalData(data);
    setActiveModal(type);
  };

  const handleClose = () => {
    setModalData(undefined);
    setActiveModal(null);
  };

  const isOpen = (type: ModalType) => activeModal === type;

  return {
    modalData,
    activeModal,
    isOpen,
    handleOpen,
    handleClose,
  };
}
