import { Button } from "@/components";
import type { Dispatch, SetStateAction } from "react";
import { useTranslation } from "react-i18next";
import { useFormContext } from "react-hook-form";
import type { Notes } from "@/models/Notes.ts";
import { useCreateNote, useUpdateNote } from "@/modules/Notes/hooks";

interface CreateEditNoteModalFooterProps {
  setIsOpenModal: Dispatch<SetStateAction<boolean>>;
  deselectEditNote: VoidFunction;
  editNote: Notes | null;
}

export const CreateEditNoteModalFooter = ({ setIsOpenModal, deselectEditNote, editNote }: CreateEditNoteModalFooterProps) => {
  const { t } = useTranslation();
  const { handleSubmit } = useFormContext<Partial<Notes>>();
  const { createNoteMutation } = useCreateNote();
  const { updateNoteMutation } = useUpdateNote();

  const submitHandler = handleSubmit(async (data) => {
    if (editNote) await updateNoteMutation({ ...data, id: editNote.id }, { onSuccess: () => setIsOpenModal(false) });
    else await createNoteMutation(data, { onSuccess: () => setIsOpenModal(false) });
  });

  return (
    <div className="flex items-center justify-end gap-2">
      <Button
        variant="outline"
        onClick={() => {
          deselectEditNote();
          setIsOpenModal(false);
        }}
      >
        {t("cancel")}
      </Button>
      <Button onClick={submitHandler} className="bg-cinco">
        {t("save")}
      </Button>
    </div>
  );
};
