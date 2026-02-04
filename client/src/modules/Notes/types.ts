import type { Notes } from "@/models/Notes.ts";

export interface CreateNoteResponseModel {
  message: string;
  status: string;
  note: Notes;
}

export interface UpdateNoteResponseModel {
  message: string;
  status: string;
}

export interface RetrieveNotesResponseModel {
  status: string;
  notes: Notes[];
}
