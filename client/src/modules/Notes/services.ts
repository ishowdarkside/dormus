import type { Notes } from "@/models/Notes.ts";
import { api, ApiService } from "@/lib/api.ts";
import type { CreateNoteResponseModel, RetrieveNotesResponseModel, UpdateNoteResponseModel } from "@/modules/Notes/types.ts";

export const CreateNoteService = async (data: Partial<Notes>) => {
  return await ApiService.post<Partial<Notes>, CreateNoteResponseModel>(api.notes, "", data);
};

export const RetrieveNotesService = async () => {
  return await ApiService.get<RetrieveNotesResponseModel>(api.notes);
};

export const UpdateNoteService = async (data: Partial<Notes>) => {
  return await ApiService.post<Partial<Notes>, UpdateNoteResponseModel>(api.notes, "/update", data);
};

export const DeleteNoteService = async (id: number) => {
  return await ApiService.delete(api.notes, `/${id}`);
};
