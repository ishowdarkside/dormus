import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Notes } from "@/models/Notes.ts";
import {
  CreateNoteService,
  DeleteNoteService,
  RetrieveNotesService,
  UpdateNoteService
} from "@/modules/Notes/services.ts";
import { HTTP_STATUS, SERVER_RESPONSE_STATUS } from "@/utils/common.ts";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import type { AxiosError } from "axios";
import type { ServerError } from "@/models/errors.ts";
import { NotesQueryKeys } from "@/modules/Notes/queryKeys.ts";
import { queryClient } from "@/App.tsx";
import { Pen, Trash } from "phosphor-react";
import { sortNotesPinnedFirst } from "@/modules/Notes/utils.ts";
import { useUser } from "@/hooks";
import { USER_ROLE } from "@/models/User.ts";

export const useDeleteNote = () => {
  const queryClient = useQueryClient();
  const { mutateAsync: deleteNoteMutation } = useMutation({
    mutationFn: DeleteNoteService,
    onMutate: (payload) => {
      const notes = queryClient.getQueryData<Notes[]>(NotesQueryKeys.Notes);
      if (!notes?.length) return;

      const updatedNotes = notes.filter((note) => note.id !== payload);
      queryClient.setQueryData(NotesQueryKeys.Notes, updatedNotes);

      return notes;
    },
    onSuccess: (res, __, prev) => {
      if (res.status !== HTTP_STATUS.NoContent) queryClient.setQueryData(NotesQueryKeys.Notes, prev);
    },
  });

  return { deleteNoteMutation };
};

export const useNotesModule = () => {
  const { t } = useTranslation();
  const { notes } = useNotes();
  const { user } = useUser();

  const [selectedNote, setSelectedNote] = useState<Notes | null>(null);
  const [selectedNoteForEdit, setSelectedNoteForEdit] = useState<Notes | null>(null);
  const [isOpenCreateEditNoteModal, setIsOpenCreateEditNoteModal] = useState(false);
  const { deleteNoteMutation } = useDeleteNote();

  const deselectEditNote = () => setSelectedNoteForEdit(null);
  const isCreatorOrRoleParent = selectedNote?.created_by === user?.id || user?.role === USER_ROLE.Parent;
  const options = [
    {
      ...(isCreatorOrRoleParent
        ? {
            label: t("edit"),
            icon: <Pen />,
            handler: () => {
              setIsOpenCreateEditNoteModal(true);
              setSelectedNoteForEdit(selectedNote);
            },
          }
        : {}),
    },
    {
      ...(isCreatorOrRoleParent
        ? {
            label: t("delete"),
            icon: <Trash />,
            handler: async () => {
              if (!selectedNote?.id) return;
              await deleteNoteMutation(selectedNote.id);
            },
          }
        : {}),
    },
  ];

  useEffect(() => {
    if (selectedNote && !notes?.some((note) => note.id === selectedNote.id)) {
      if (notes?.length) setSelectedNote(notes?.[0]);
      else setSelectedNote(null);
    }
    if (selectedNote && !notes?.length) setSelectedNote(null);
    if (!selectedNote && notes?.length) setSelectedNote(notes?.[0]);
  }, [notes]);

  return {
    isOpenCreateEditNoteModal,
    setIsOpenCreateEditNoteModal,
    selectedNote,
    setSelectedNote,
    options,
    selectedNoteForEdit,
    deselectEditNote,
  };
};

export const useCreateNote = () => {
  const { t } = useTranslation();

  const { mutateAsync } = useMutation({
    mutationFn: (data: Partial<Notes>) => CreateNoteService(data),
    onSuccess: (res) => {
      if (res.data.status !== SERVER_RESPONSE_STATUS.Success) return;
      toast.success(t(res.data.message));

      const notes = queryClient.getQueryData<Notes[]>(NotesQueryKeys.Notes);
      if (!notes) return;

      const isExistingNote = notes.some((note) => note.id === res.data.note.id);
      if (isExistingNote) return;

      let updatedNotes;
      if (res.data.note.is_pinned) updatedNotes = [res.data.note, ...notes];
      else updatedNotes = [...notes, res.data.note];

      queryClient.setQueryData(NotesQueryKeys.Notes, updatedNotes);
    },
  });

  return { createNoteMutation: mutateAsync };
};

export const useNotes = () => {
  const { data: notes, isLoading: isLoadingNotes } = useQuery<Notes[], AxiosError<ServerError>>({
    queryKey: NotesQueryKeys.Notes,
    queryFn: async () => await RetrieveNotesService().then((res) => res.data.notes),
  });

  return { notes, isLoadingNotes };
};

export const useUpdateNote = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const { mutateAsync: updateNoteMutation } = useMutation({
    mutationFn: UpdateNoteService,
    onSuccess: (res, data) => {
      if (res.data.status !== SERVER_RESPONSE_STATUS.Success) return;
      toast.success(t(res.data.message));

      const notes = queryClient.getQueryData<Notes[]>(NotesQueryKeys.Notes);
      if (!notes) return;

      const updatedNotes = sortNotesPinnedFirst(notes.map((note) => (note.id === data.id ? { ...note, ...data } : { ...note })));
      queryClient.setQueryData(NotesQueryKeys.Notes, updatedNotes);
    },
  });

  return { updateNoteMutation };
};
