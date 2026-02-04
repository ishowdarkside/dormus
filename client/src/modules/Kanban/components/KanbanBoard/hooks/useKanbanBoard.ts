import {
  defaultDropAnimationSideEffects,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useKanbanColumns } from "@/modules/Kanban/hooks";
import { useKanbanTasks, useUpdateKanbanTask } from "@/modules/Kanban/hooks/useKanbanTasks.ts";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import type { KanbanTask } from "@/models/Kabanan.ts";
import { KanbanQueryKeys } from "@/modules/Kanban/queryKeys.ts";

export const useKanbanBoard = () => {
  const queryClient = useQueryClient();
  const { kanbanColumns } = useKanbanColumns();
  const { kanbanTasks: serverTasks } = useKanbanTasks();
  const { updateKanbanTaskMutation } = useUpdateKanbanTask();

  const [activeTask, setActiveTask] = useState<KanbanTask | undefined>();
  const [localTasks, setLocalTasks] = useState<KanbanTask[] | null>(null);

  const displayTasks = localTasks || serverTasks || [];

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    const task = serverTasks.find((t) => t.id === event.active.id);
    setActiveTask(task);
    setLocalTasks(serverTasks);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over || !localTasks) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const activeTask = localTasks.find((t) => t.id === activeId);
    if (!activeTask) return;

    const overTask = localTasks.find((t) => t.id === overId);
    const isOverAColumn = kanbanColumns?.some((col) => col.id === overId);

    const targetColumnId = overTask ? overTask.column_id : isOverAColumn ? overId : null;

    if (targetColumnId !== null && activeTask.column_id !== targetColumnId) {
      setLocalTasks((prev) => {
        if (!prev) return null;

        const oldIndex = prev.findIndex((t) => t.id === activeId);
        const newIndex = overTask ? prev.findIndex((t) => t.id === overId) : prev.length;

        const updated = [...prev];
        updated[oldIndex] = { ...updated[oldIndex], column_id: targetColumnId as string };

        return arrayMove(updated, oldIndex, newIndex);
      });
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (localTasks && over) {
      queryClient.setQueryData(KanbanQueryKeys.Tasks, localTasks);

      const droppedTask = localTasks.find((t) => t.id === active.id);
      if (droppedTask)
        await updateKanbanTaskMutation({
          column_id: droppedTask.column_id,
          task_id: droppedTask.id,
        });
    }

    setActiveTask(undefined);
    setLocalTasks(null);
  };

  return {
    sensors,
    handleDragEnd,
    handleDragOver,
    handleDragStart,
    activeTask,
    displayTasks,
    dropAnimation: {
      sideEffects: defaultDropAnimationSideEffects({
        styles: { active: { opacity: "0.5" } },
      }),
    },
  };
};
