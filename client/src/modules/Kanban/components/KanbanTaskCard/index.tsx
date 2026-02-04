import type { KanbanTask } from "@/models/Kabanan.ts";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useGetMatchingAssigneesForTask } from "@/modules/Kanban/hooks";
import { TaskPriorityLabel } from "@/modules/Kanban/components";
import { useFindFamilyMemberById } from "@/modules/FamilyManager/hooks";
import { AssigneeAvatarWrapper } from "@/modules/Kanban/components/KanbanTaskCard/components/AssigneeAvatarWrapper.tsx";

interface KanbanTaskCardProps {
  task: KanbanTask;
  onSetOpenTask?: (task: KanbanTask) => void;
}

export const KanbanTaskCard = ({ task, onSetOpenTask }: KanbanTaskCardProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });

  const ticketCreatorUser = useFindFamilyMemberById(task.creator_id);
  const assignees = useGetMatchingAssigneesForTask(task.id);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className="bg-white border-neutral-200 flex flex-col justify-between p-4 mb-6 rounded-sm border h-45  cursor-grab active:cursor-grabbing transition-colors"
        onClick={() => onSetOpenTask?.(task)}
      >
        <div>
          <div className="flex flex-col mb-3">
            <p className="text-[10px] uppercase text-neutral-400 mb-0.5">{ticketCreatorUser?.name}</p>
            <h3 className="text-[15px] truncate max-w-82.5">{task.title}</h3>
          </div>
          {task.description && <p className="text-xs text-neutral-500 mt-1  line-clamp-2">{task.description}</p>}
        </div>

        <div>
          <div className="w-full h-px bg-neutral-200 my-4"></div>

          <div className="flex items-center justify-between ">
            <AssigneeAvatarWrapper assignees={assignees} />
            <TaskPriorityLabel priority={task.priority} />
          </div>
        </div>
      </div>
    </>
  );
};
