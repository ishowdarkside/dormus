import { useTranslation } from "react-i18next";
import { Button, Dialog, DialogContent, DialogHeader, DialogTitle, Form, FormInput } from "@/components";
import type { Budget } from "@/models/Budget.ts";
import { useCreateEditBudgetModal } from "@/modules/Financials/hooks/useCreateEditBudgetModal.ts";
import type { Dispatch, SetStateAction } from "react";

export interface CreateEditBudgetModalPropTypes {
  selectedBudgetItem: Budget | null;
  setSelectedBudgetItem: Dispatch<SetStateAction<Budget | null>>;
}

export const CreateEditBudgetModal = ({ selectedBudgetItem, setSelectedBudgetItem }: CreateEditBudgetModalPropTypes) => {
  const { t } = useTranslation();
  const { isOpenModal, openModal, closeModal, handleSubmit } = useCreateEditBudgetModal({ setSelectedBudgetItem, selectedBudgetItem });

  return (
    <>
      <div className="flex justify-end">
        <Button onClick={openModal}>{t("create_budget")}</Button>
      </div>
      {(isOpenModal || selectedBudgetItem) && (
        <Dialog open={isOpenModal || Boolean(selectedBudgetItem)} onOpenChange={(isClosed) => (isClosed ? openModal() : closeModal())}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t(selectedBudgetItem ? "edit_budget" : "create_budget")}</DialogTitle>
            </DialogHeader>

            <Form<Partial<Budget>>
              onSubmit={handleSubmit}
              defaultValues={{
                name: selectedBudgetItem?.name,
                price: selectedBudgetItem?.price,
                progress: selectedBudgetItem?.progress || undefined,
              }}
            >
              <div className="flex flex-col gap-3">
                <FormInput<Budget> name="name" placeholder={t("name")} />
                <FormInput<Budget> name="price" type="number" placeholder={t("price")} />
                {selectedBudgetItem && <FormInput<Budget> name="progress" placeholder={t("progress")} />}
              </div>

              <div className="flex items-center justify-end gap-2 mt-4">
                <Button
                  variant="outline"
                  onClick={(e) => {
                    e.preventDefault();
                    closeModal();
                  }}
                >
                  {t("cancel")}
                </Button>
                <Button type="submit" className="bg-cinco">
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
