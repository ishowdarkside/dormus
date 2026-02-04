import { useTranslation } from "react-i18next";
import { Plus } from "phosphor-react";
import type { Dispatch, SetStateAction } from "react";
import { useNotes } from "@/modules/Notes/hooks";
import { NoteRow } from "@/modules/Notes/components/NoteRow.tsx";
import { LoadingSpinner } from "@/components";
import type { Notes } from "@/models/Notes.ts";

interface NotesListProps {
  setIsOpenCreateEditNoteModal: Dispatch<SetStateAction<boolean>>;
  setSelectedNote: Dispatch<SetStateAction<Notes | null>>;
  selectedNote: Notes | null;
}

export const NotesList = ({ setIsOpenCreateEditNoteModal, setSelectedNote, selectedNote }: NotesListProps) => {
  const { t } = useTranslation();
  const { notes, isLoadingNotes } = useNotes();

  if (isLoadingNotes)
    return (
      <div className="w-full h-full flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  return (
    <div className="flex-1  pr-22 overflow-y-auto">
      <div
        className="bg-neutral-100 p-5 mb-8 flex gap-6 items-center rounded-sm transition-all cursor-pointer hover:bg-neutral-200"
        onClick={() => setIsOpenCreateEditNoteModal(true)}
      >
        <Plus />
        <span>{t("add_note")}</span>
      </div>

      <div className="flex flex-col gap-6 pb-6">
        {notes?.map((note) => (
          <NoteRow note={note} key={note.id} setSelectedNote={setSelectedNote} selectedNote={selectedNote} />
        ))}
      </div>
    </div>
  );
};
