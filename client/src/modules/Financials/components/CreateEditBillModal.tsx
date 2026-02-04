import {
  Button,
  Calendar,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Form,
  FormDropdown,
  FormInput,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components";
import type { Bill } from "@/models/Bill.ts";
import { useTranslation } from "react-i18next";
import { type Dispatch, type SetStateAction } from "react";
import { format } from "date-fns";
import { ChevronDownIcon } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { useCreateEditBillModal, useDeleteBill } from "@/modules/Financials/hooks";
import { Trash } from "phosphor-react";

interface CreateEditBillModalProps {
  selectedBill: Bill | null;
  setSelectedBill: Dispatch<SetStateAction<Bill | null>>;
}

export const CreateEditBillModal = ({ selectedBill, setSelectedBill }: CreateEditBillModalProps) => {
  const { t } = useTranslation();
  const { handleModalStateChange, handleSubmit, isOpenModalOrSelectedBill, setIsOpenModal, statusOptions, closeModal } =
    useCreateEditBillModal(selectedBill, setSelectedBill);

  const { deleteBillMutation } = useDeleteBill();
  return (
    <>
      <Button onClick={() => setIsOpenModal(true)}>{t("add_bill")}</Button>
      {isOpenModalOrSelectedBill && (
        <Dialog open={isOpenModalOrSelectedBill} onOpenChange={handleModalStateChange}>
          <DialogContent>
            <Form<Partial<Bill>>
              onSubmit={handleSubmit}
              defaultValues={{
                name: selectedBill?.name,
                price: selectedBill?.price,
                due_date: selectedBill?.due_date,
                status: selectedBill?.status,
              }}
            >
              <DialogHeader>
                <DialogTitle className="mb-4">{t(selectedBill ? "edit_bill" : "add_bill")}</DialogTitle>
              </DialogHeader>

              <div className="flex flex-col gap-3">
                <FormInput<Partial<Bill>> name="name" required placeholder={t("bill_name")} />
                <FormInput<Partial<Bill>> name="price" type="number" required placeholder={t("price")} />
                <DatePickerBillModal />
                {selectedBill && <FormDropdown<Partial<Bill>> required options={statusOptions} name="status" trigger={t("status")} />}
              </div>
              <div className="flex items-center justify-end gap-2 mt-4">
                {selectedBill && (
                  <Button
                    variant="destructive"
                    type="reset"
                    onClick={async (e) => {
                      e.preventDefault();
                      await deleteBillMutation(selectedBill?.id);
                      closeModal(e);
                    }}
                  >
                    <Trash />
                  </Button>
                )}
                <Button variant="outline" type="reset" onClick={closeModal}>
                  {t("cancel")}
                </Button>
                <Button className="bg-cinco" type="submit">
                  {t("save")}
                </Button>
              </div>
            </Form>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

const DatePickerBillModal = () => {
  const { t } = useTranslation();
  const { watch, setValue } = useFormContext<Partial<Bill>>();
  const selectedDueDate = watch("due_date");
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          data-empty={true}
          className="data-[empty=true]:text-muted-foreground  justify-between text-left font-normal"
        >
          {selectedDueDate ? format(selectedDueDate, "PPP") : <span>{t("choose_due_date")}</span>}
          <ChevronDownIcon />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selectedDueDate}
          onSelect={(value) => setValue("due_date", value)}
          defaultMonth={selectedDueDate}
        />
      </PopoverContent>
    </Popover>
  );
};
