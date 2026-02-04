import type { KanbanColumn, KanbanTask } from "@/models/Kabanan.ts";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { KanbanCreateEditTaskModal, KanbanTaskCard } from "@/modules/Kanban/components";
import { useDroppable } from "@dnd-kit/core";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { Button } from "@/components";
import { Plus } from "phosphor-react";

interface KanbanColumnPropTypes {
  column: KanbanColumn;
  tasks: KanbanTask[];
}
export const KanbanColumnComponent = ({ column, tasks }: KanbanColumnPropTypes) => {
  const { t } = useTranslation();

  const { setNodeRef } = useDroppable({ id: column.id });
  const [isCreateEditModalOpen, setIsCreateEditModalOpen] = useState(false);
  const [openTask, setOpenTask] = useState<KanbanTask | null>(null);

  const closeTaskModal = () => {
    setOpenTask(null);
    setIsCreateEditModalOpen(false);
  };

  const openTaskModal = () => setIsCreateEditModalOpen(true);
  const handleOpenTask = (task: KanbanTask) => {
    setOpenTask(task);
    setIsCreateEditModalOpen(true);
  };

  return (
    <div className=" flex flex-col flex-1  ">
      <div className="flex mb-6">
        <div className="bg-linear-to-tr from-cinco  to-[#75B3AA] py-4 px-6 rounded-l-[10px] min-w-[60px] font-light  text-uno">
          {tasks.length}
        </div>
        <div className="flex flex-1 items-center justify-between py-2 pl-5 pr-2 bg-neutral-50 border border-neutral-200  rounded-r-[10px]">
          <span className="font-light text-sm">{t(column.name)}</span>

          <Button variant="ghost" onClick={openTaskModal}>
            <Plus />
          </Button>

          {isCreateEditModalOpen && (
            <KanbanCreateEditTaskModal
              column={column}
              isOpen={isCreateEditModalOpen}
              closeModal={closeTaskModal}
              openModal={openTaskModal}
              editTask={openTask}
            />
          )}
        </div>
      </div>

      <div ref={setNodeRef} className="transition-colors min-h-[500px]">
        <SortableContext items={tasks} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <KanbanTaskCard task={task} key={task.id} onSetOpenTask={handleOpenTask} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
};
