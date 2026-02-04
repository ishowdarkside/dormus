import { AvatarFromFirstName } from "@/components";
import type { KanbanTaskAssignee } from "@/models/Kabanan.ts";
import { useFamilyMembers } from "@/modules/FamilyManager/hooks";
import { findFamilyMemberById } from "@/utils/common.ts";

interface AssigneeAvatarWrapperProps {
  assignees: KanbanTaskAssignee[];
}

export const AssigneeAvatarWrapper = ({ assignees }: AssigneeAvatarWrapperProps) => {
  const { familyMembers } = useFamilyMembers();

  return (
    <div className="flex gap-1">
      {assignees.length > 3 ? (
        <div className="flex gap-1 items-center">
          {assignees.slice(0, 3).map((e) => (
            <AvatarFromFirstName key={e.id} firstname={findFamilyMemberById(e.user_id, familyMembers)?.name} />
          ))}
          <span className="text-xs ml-1">+{assignees.length - 3}</span>
        </div>
      ) : (
        assignees.map((e) => <AvatarFromFirstName key={e.id} firstname={findFamilyMemberById(e.user_id, familyMembers)?.name} />)
      )}
    </div>
  );
};
