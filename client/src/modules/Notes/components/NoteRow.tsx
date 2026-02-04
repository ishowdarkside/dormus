import type { Notes } from "@/models/Notes.ts";
import { format } from "date-fns";
import { PushPin } from "phosphor-react";
import type { Dispatch, SetStateAction } from "react";
import { cn } from "@/lib/utils.ts";

interface NoteRowProps {
  note: Notes;
  setSelectedNote: Dispatch<SetStateAction<Notes | null>>;
  selectedNote: Notes | null;
}
export const NoteRow = ({ note, setSelectedNote, selectedNote }: NoteRowProps) => {
  return (
    <div
      className={cn(
        "border border-neutral-200 min-h-[100px] p-3 flex flex-col gap-2 rounded-sm transition-all  cursor-pointer hover:bg-neutral-100",
        selectedNote?.id === note.id && "bg-neutral-200",
      )}
      onClick={() => setSelectedNote(note)}
    >
      <div className="flex items-center justify-between mb-2">
        {note.is_pinned && <PushPin />}
        <span className="text-xs">{format(note.created_at, "dd MMM yyyy").toUpperCase()}</span>
      </div>
      <span className="text-sm truncate max-w-97.5">{note.title}</span>
      <span className="text-xs text-neutral-500 line-clamp-2">{note.description}</span>
    </div>
  );
};
