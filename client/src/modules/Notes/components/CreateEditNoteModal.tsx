import { Dialog, DialogContent, DialogHeader, DialogTitle, Form, FormInput, FormSwitch, FormTextarea } from "@/components";
import { useTranslation } from "react-i18next";
import type { Dispatch, SetStateAction } from "react";
import type { Notes } from "@/models/Notes.ts";
import { CreateEditNoteModalFooter } from "@/modules/Notes/components/CreateEditNoteModalFooter.tsx";

interface CreateEditNoteModalProps {
  editNote?: Notes | null;
  setIsOpenModal: Dispatch<SetStateAction<boolean>>;
  isOpenModal: boolean;
  deselectEditNote: VoidFunction;
}

export const CreateEditNoteModal = ({ editNote, setIsOpenModal, isOpenModal, deselectEditNote }: CreateEditNoteModalProps) => {
  const { t } = useTranslation();

  return (
    <Form<Partial<Notes>> defaultValues={{ title: editNote?.title, description: editNote?.description, is_pinned: editNote?.is_pinned }}>
      <Dialog
        onOpenChange={(open) => {
          if (!open) deselectEditNote();
          setIsOpenModal(open);
        }}
        open={isOpenModal}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="mb-4">{t(editNote ? "edit_note" : "create_note")}</DialogTitle>

            <div className="flex flex-col gap-3">
              <FormInput<Partial<Notes>> name="title" placeholder={t("title")} />
              <FormTextarea<Partial<Notes>>
                name="description"
                className="min-h-100 max-h-125"
                placeholder={t("description")}
                required={false}
              />

              <div className="flex items-center gap-4">
                <FormSwitch<Partial<Notes>> name="is_pinned" />
                <span className="text-sm">{t("pinned_create")}</span>
              </div>
            </div>
          </DialogHeader>

          <CreateEditNoteModalFooter setIsOpenModal={setIsOpenModal} deselectEditNote={deselectEditNote} editNote={editNote} />
        </DialogContent>
      </Dialog>
    </Form>
  );
};
