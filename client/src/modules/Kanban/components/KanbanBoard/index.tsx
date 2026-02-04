import { useKanbanBoard } from "@/modules/Kanban/components/KanbanBoard/hooks";
import { closestCorners, DndContext, DragOverlay } from "@dnd-kit/core";
import { KanbanColumnComponent, KanbanTaskCard } from "@/modules/Kanban/components";
import { useKanbanColumns } from "@/modules/Kanban/hooks";

export const KanbanBoard = () => {
  const { kanbanColumns } = useKanbanColumns();
  const { sensors, handleDragEnd, handleDragOver, handleDragStart, activeTask, dropAnimation, displayTasks } = useKanbanBoard();

  return (
    <div>
      <div className="flex gap-6 overflow-hidden ">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragEnd={handleDragEnd}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
        >
          {kanbanColumns?.map((col) => (
            <KanbanColumnComponent column={col} key={col.id} tasks={displayTasks.filter((t) => t.column_id === col.id)} />
          ))}

          <DragOverlay dropAnimation={dropAnimation}>{activeTask ? <KanbanTaskCard task={activeTask} /> : null}</DragOverlay>
        </DndContext>
      </div>
    </div>
  );
};
