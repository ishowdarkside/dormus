import { Dialog, DialogContent, DialogHeader, DialogTitle, Form, LoadingSpinner } from "@/components";
import { useTranslation } from "react-i18next";
import type { KanbanColumn, KanbanTask } from "@/models/Kabanan.ts";
import type { CreateEditTicketAndAssigneeModel } from "@/modules/Kanban/types.ts";
import { KanbanTaskModalFooter } from "@/modules/Kanban/components/KanbanCreateEditTaskModal/components/KanbanTaskModalFooter.tsx";
import { KanbanTaskModalContent } from "@/modules/Kanban/components/KanbanCreateEditTaskModal/components/KanbanTaskModalContent.tsx";
import { useFamilyTaskAssignments, useGetMatchingAssigneesForTask } from "@/modules/Kanban/hooks";

interface KanbanCreateTaskModalProps {
  column: KanbanColumn;
  isOpen: boolean;
  closeModal: VoidFunction;
  openModal: VoidFunction;
  editTask: KanbanTask | null;
}

export const KanbanCreateEditTaskModal = ({ column, isOpen, openModal, closeModal, editTask }: KanbanCreateTaskModalProps) => {
  const { t } = useTranslation();

  const { isLoading } = useFamilyTaskAssignments();
  const assignees = useGetMatchingAssigneesForTask(editTask?.id);

  if (isLoading) return <LoadingSpinner />;

  return (
    <Form<CreateEditTicketAndAssigneeModel>
      defaultValues={{
        assignees: [...assignees.map((e) => e.user_id)],
        column_id: editTask?.column_id || column.id,
        title: editTask?.title || "",
        description: editTask?.description || "",
        priority: editTask?.priority,
      }}
    >
      <Dialog open={isOpen} onOpenChange={(closed) => (closed ? openModal() : closeModal())}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t(editTask ? "edit_ticket" : "create_new_ticket")}</DialogTitle>
          </DialogHeader>
          <KanbanTaskModalContent />
          <KanbanTaskModalFooter closeModal={closeModal} editTask={editTask} />
        </DialogContent>
      </Dialog>
    </Form>
  );
};
