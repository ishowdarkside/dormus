import type { Notes } from "@/models/Notes.ts";

export const sortNotesPinnedFirst = (notes: Notes[]) => {
  return notes.sort((a, b) => Number(b.is_pinned) - Number(a.is_pinned));
};
