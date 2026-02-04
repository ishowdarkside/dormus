import { type Bill, BillStatusNotPaid, BillStatusPaid } from "@/models/Bill.ts";
import { useCreateBill, useUpdateBill } from "@/modules/Financials/hooks/useBills.ts";
import { type Dispatch, type MouseEvent, type SetStateAction, useState } from "react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { SERVER_RESPONSE_STATUS } from "@/utils/common.ts";
import { Check, X } from "phosphor-react";

export const useCreateEditBillModal = (selectedBill: Bill | null, setSelectedBill: Dispatch<SetStateAction<Bill | null>>) => {
  const { t } = useTranslation();
  const { createBillMutation } = useCreateBill();
  const { updateBillMutation } = useUpdateBill();
  const [isOpenModal, setIsOpenModal] = useState(false);

  const isOpenModalOrSelectedBill = isOpenModal || Boolean(selectedBill);

  const handleSubmit = async (data: Partial<Bill>) => {
    let response;

    if (selectedBill) response = await updateBillMutation({ ...data, id: selectedBill.id });
    else response = await createBillMutation(data);

    setIsOpenModal(false);
    setSelectedBill(null);

    if (response.data.status === SERVER_RESPONSE_STATUS.Success) toast.success(t(response.data.message));
  };

  const handleModalStateChange = (closed: boolean) => {
    if (closed) setIsOpenModal(true);
    else {
      setIsOpenModal(false);
      setSelectedBill(null);
    }
  };

  const statusOptions = [
    { value: BillStatusPaid, label: t(BillStatusPaid), icon: <Check /> },
    { value: BillStatusNotPaid, label: t(BillStatusNotPaid), icon: <X /> },
  ];

  const closeModal = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsOpenModal(false);
    setSelectedBill(null);
  };

  return { isOpenModalOrSelectedBill, handleSubmit, handleModalStateChange, setIsOpenModal, statusOptions, closeModal };
};
