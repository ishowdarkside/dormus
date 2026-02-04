import { useTranslation } from "react-i18next";
import { CreateEditNoteModal, NotesList, SelectedNote } from "@/modules/Notes/components";
import { useNotesModule } from "@/modules/Notes/hooks";

export const Notes = () => {
  const { t } = useTranslation();
  const {
    isOpenCreateEditNoteModal,
    setIsOpenCreateEditNoteModal,
    selectedNote,
    setSelectedNote,
    options,
    selectedNoteForEdit,
    deselectEditNote,
  } = useNotesModule();

  return (
    <>
      {isOpenCreateEditNoteModal && (
        <CreateEditNoteModal
          editNote={selectedNoteForEdit}
          deselectEditNote={deselectEditNote}
          setIsOpenModal={setIsOpenCreateEditNoteModal}
          isOpenModal={isOpenCreateEditNoteModal}
        />
      )}
      <div className="mx-auto h-full">
        <h2 className=" text-3xl mb-8">{t("notes")}</h2>
        <div className="flex h-full">
          <NotesList
            setIsOpenCreateEditNoteModal={setIsOpenCreateEditNoteModal}
            setSelectedNote={setSelectedNote}
            selectedNote={selectedNote}
          />
          <SelectedNote note={selectedNote} options={options} />
        </div>
      </div>
    </>
  );
};
