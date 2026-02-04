import { useQueryClient } from "@tanstack/react-query";
import type { WebsocketHandlerModel } from "@/lib/websocket.ts";
import type { User } from "@/models/User.ts";
import { v4 as uuidv4 } from "uuid";
import { FamilyManagerQueryKeys } from "@/modules/FamilyManager/queryKeys.ts";
import type { Family } from "@/models/Family.ts";
import { HooksQueryKeys } from "@/hooks/queryKeys.ts";
import type { KanbanTask, KanbanTaskAssignee } from "@/models/Kabanan.ts";
import { KanbanQueryKeys } from "@/modules/Kanban/queryKeys.ts";
import type { Notes } from "@/models/Notes.ts";
import { NotesQueryKeys } from "@/modules/Notes/queryKeys.ts";
import { sortNotesPinnedFirst } from "@/modules/Notes/utils.ts";
import type { Bill } from "@/models/Bill.ts";
import { FinancialsQueryKeys } from "@/modules/Financials/queryKeys.ts";

export const useInitiliazeHandlers = () => {
  const queryClient = useQueryClient();

  const handlers: WebsocketHandlerModel[] = [
    {
      action: "delete",
      model: "bill",
      handler: ({ id }: { id: number }) => {
        const bills = queryClient.getQueryData<Bill[]>(FinancialsQueryKeys.Bills);
        if (!bills?.length) return;

        const updatedBills = bills.filter((e) => e.id !== id);
        queryClient.setQueryData(FinancialsQueryKeys.Bills, updatedBills);
      },
    },
    {
      action: "upsert",
      model: "bill",
      handler: (data: Bill) => {
        const bills = queryClient.getQueryData<Bill[]>(FinancialsQueryKeys.Bills);
        if (!bills) return;

        const isExistingNote = bills.some((e) => e.id == data.id);
        if (isExistingNote) {
          const updatedBills = bills.map((bill) => (bill.id === data.id ? { ...bill, ...data } : { ...bill }));
          queryClient.setQueryData(FinancialsQueryKeys.Bills, updatedBills);
          return;
        }

        const updatedBills = [...bills, data];
        queryClient.setQueryData(FinancialsQueryKeys.Bills, updatedBills);
      },
    },
    {
      action: "delete",
      model: "note",
      handler: ({ id }: { id: number }) => {
        const notes = queryClient.getQueryData<Notes[]>(NotesQueryKeys.Notes);
        if (!notes?.length) return;

        const updatedNotes = notes.filter((n) => n.id !== id);
        queryClient.setQueryData(NotesQueryKeys.Notes, updatedNotes);
      },
    },
    {
      action: "upsert",
      model: "note",
      handler: (data: Notes) => {
        const notes = queryClient.getQueryData<Notes[]>(NotesQueryKeys.Notes);
        if (!notes) return;

        const isExistingNote = notes.some((note) => note.id === data.id);
        if (isExistingNote) {
          const updatedNotes = sortNotesPinnedFirst(notes.map((note) => (note.id === data.id ? { ...note, ...data } : { ...note })));

          queryClient.setQueryData(NotesQueryKeys.Notes, updatedNotes);
          return;
        }

        let updatedNotes;
        if (data.is_pinned) updatedNotes = [data, ...notes];
        else [...notes, data];

        queryClient.setQueryData(NotesQueryKeys.Notes, updatedNotes);
      },
    },
    {
      action: "delete",
      model: "kanban_task",
      handler: ({ id }: { id: number }) => {
        const currentTasks = queryClient.getQueryData<KanbanTask[]>(KanbanQueryKeys.Tasks);
        if (!currentTasks) return;

        const updatedTasks = currentTasks.filter((e) => e.id !== id);
        queryClient.setQueryData(KanbanQueryKeys.Tasks, updatedTasks);
      },
    },
    {
      action: "upsert",
      model: "kanban_task_assignee",
      handler: (data: { task_id: number; user_id: number[]; family_id: number }) => {
        const currentTaskAssignees = queryClient.getQueryData<KanbanTaskAssignee[]>(KanbanQueryKeys.TaskAssignments);
        if (!currentTaskAssignees) return;

        const updatedTasks = currentTaskAssignees.filter((task) => {
          if (data.task_id !== task.task_id) return true;
          if (!data.user_id.includes(task.user_id)) return false;
        });

        updatedTasks.push(
          ...data.user_id.map((e) => ({
            user_id: e,
            family_id: data.family_id,
            id: uuidv4(),
            task_id: data.task_id,
            assigned_at: new Date(),
          })),
        );

        queryClient.setQueryData(KanbanQueryKeys.TaskAssignments, updatedTasks);
      },
    },
    {
      action: "upsert",
      model: "kanban_task",
      handler: (data: KanbanTask) => {
        const currentKanbanTasks = queryClient.getQueryData<KanbanTask[]>(KanbanQueryKeys.Tasks);
        if (!currentKanbanTasks) return;

        const matchingTask = currentKanbanTasks.find((task) => task.id === data.id);
        if (!matchingTask) {
          queryClient.setQueryData(KanbanQueryKeys.Tasks, [...currentKanbanTasks, data]);
          return;
        }

        const updatedTasks = currentKanbanTasks.map((task) => (task.id === data.id ? { ...task, ...data } : { ...task }));
        queryClient.setQueryData(KanbanQueryKeys.Tasks, updatedTasks);
      },
    },
    {
      action: "upsert",
      model: "family_member",
      handler: (data: User) => {
        const currentFamilyMembers = queryClient.getQueryData<User[]>(FamilyManagerQueryKeys.Users);
        if (!currentFamilyMembers) return;

        const existingUserIdx = currentFamilyMembers.findIndex((member) => member.id === data.id);
        if (existingUserIdx < 0) {
          queryClient.setQueryData(FamilyManagerQueryKeys.Users, [data, ...currentFamilyMembers]);
          return;
        }

        const updatedFamilyMembers = currentFamilyMembers.map((m) => (m.id === data.id ? { ...m, ...data } : { ...m }));
        queryClient.setQueryData(FamilyManagerQueryKeys.Users, updatedFamilyMembers);
      },
    },
    {
      action: "delete",
      model: "family_member",
      handler: (data: { id: number }) => {
        const currentFamilyMembers = queryClient.getQueryData<User[]>(FamilyManagerQueryKeys.Users);
        if (!currentFamilyMembers?.length) return;

        const updatedFamilyMembers = currentFamilyMembers.filter((member) => member.id !== data.id);
        queryClient.setQueryData(FamilyManagerQueryKeys.Users, updatedFamilyMembers);
      },
    },
    {
      action: "upsert",
      model: "family",
      handler: (data: Family) => {
        const currFamily = queryClient.getQueryData<Family>(HooksQueryKeys.Family);
        // Porodica ne moze da ne postoji u bazi.
        if (!currFamily) return;

        queryClient.setQueryData(HooksQueryKeys.Family, { ...currFamily, ...data });
      },
    },
  ];

  return { handlers };
};
