import { useQuery } from "@tanstack/react-query";
import type { KanbanColumn } from "@/models/Kabanan.ts";
import type { AxiosError } from "axios";
import type { ServerError } from "@/models/errors.ts";
import { KanbanQueryKeys } from "@/modules/Kanban/queryKeys.ts";
import { retrieveColumnsService } from "@/modules/Kanban/services.ts";

export const useKanbanColumns = () => {
  const {
    data: kanbanColumns,
    isLoading: isLoadingKanbanColumns,
    error,
  } = useQuery<KanbanColumn[], AxiosError<ServerError>>({
    queryKey: KanbanQueryKeys.Columns,
    queryFn: async () => retrieveColumnsService().then((res) => res.data.data ?? []),
    placeholderData: [],
  });

  return { kanbanColumns, isLoadingKanbanColumns, error };
};
