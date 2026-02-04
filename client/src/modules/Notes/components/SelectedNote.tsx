import { Button, Dropdown, type DropdownOptionShape, Textarea } from "@/components";
import { DotsThree } from "phosphor-react";
import type { Notes } from "@/models/Notes.ts";
import { useFindFamilyMemberById } from "@/modules/FamilyManager/hooks";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";

interface SelectedNoteProps {
  note: Notes | null;
  options: DropdownOptionShape[];
}

export const SelectedNote = ({ note, options }: SelectedNoteProps) => {
  const { t } = useTranslation();
  const noteCreator = useFindFamilyMemberById(note?.created_by);

  if (!note) return <div className="flex-1/5"></div>;
  return (
    <div className=" flex-1/5 overflow-auto ">
      <div className="absolute h-full w-0.5 bg-neutral-100 top-0" />
      <div className="pl-22  ">
        <div className="flex justify-between items-center mb-6">
          <p className="text-3xl ">{note.title}</p>
          <Dropdown
            trigger={
              <Button variant="secondary">
                <DotsThree size={64} />
              </Button>
            }
            options={options}
          />
        </div>
        <p className="mb-1 font-light text-xs">
          {t("date")}: {format(note.created_at, "dd MMM yyyy")}
        </p>
        <p className="text-xs font-light">
          {t("created_by")}: {noteCreator?.name}
        </p>

        <Textarea
          className="mt-8  h-full border-none p-0 outline-none resize-none shadow-none ring-0  focus-visible:ring-0 "
          value={note.description}
          readOnly
        />
      </div>
    </div>
  );
};
