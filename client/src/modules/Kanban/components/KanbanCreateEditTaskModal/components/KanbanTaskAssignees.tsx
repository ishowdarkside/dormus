import { AvatarFromFirstName, FormDropdown } from "@/components";
import type { CreateEditTicketAndAssigneeModel } from "@/modules/Kanban/types.ts";
import { useFamilyMembers } from "@/modules/FamilyManager/hooks";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

export const KanbanTaskAssignees = () => {
  const { t } = useTranslation();
  const { familyMembers } = useFamilyMembers();
  const { watch } = useFormContext<CreateEditTicketAndAssigneeModel>();

  const options = familyMembers
    ? familyMembers.map((member) => ({
        value: member.id,
        label: member.name,
      }))
    : [];

  const selectedAssignees = watch("assignees");

  const placeholderForSelectedMembers = (
    <div className="w-full justify-start flex flex-col gap-2 border max-h-46.5 overflow-auto border-neutral-200 rounded-md p-2">
      {selectedAssignees?.map((m) => {
        const matchingUser = familyMembers?.find((e) => e.id === m);
        return (
          <div className="flex gap-3 border px-2 items-center py-2 rounded-md" onClick={(e) => e.stopPropagation()}>
            <AvatarFromFirstName firstname={matchingUser?.name} />
            <span className="text-xs">{matchingUser?.name}</span>
          </div>
        );
      })}
    </div>
  );
  return (
    <FormDropdown<CreateEditTicketAndAssigneeModel>
      customTrigger={selectedAssignees?.length ? placeholderForSelectedMembers : undefined}
      trigger={t("assignees")}
      options={options}
      selectMultiple
      name="assignees"
      required={false}
    />
  );
};
