import { useState } from "react";
import { useCreateBudgetItem } from "@/modules/Financials/hooks/useBudgets.ts";
import type { Budget } from "@/models/Budget.ts";
import type { CreateEditBudgetModalPropTypes } from "@/modules/Financials/components";

export const useCreateEditBudgetModal = ({ setSelectedBudgetItem, selectedBudgetItem }: CreateEditBudgetModalPropTypes) => {
  const [isOpenModal, setIsOpenModal] = useState(false);
  const { createBudgetMutation } = useCreateBudgetItem();

  const closeModal = () => {
    setSelectedBudgetItem(null);
    setIsOpenModal(false);
  };
  const openModal = () => setIsOpenModal(true);

  const handleSubmit = async (data: Partial<Budget>) => {
    await createBudgetMutation(data);
    closeModal();
  };

  return { closeModal, openModal, isOpenModal, handleSubmit };
};
