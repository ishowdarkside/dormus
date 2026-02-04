import { useUser } from "@/hooks/useUser.ts";
import { useQuery } from "@tanstack/react-query";
import type { Family } from "@/models/Family.ts";
import { HooksQueryKeys } from "@/hooks/queryKeys.ts";
import { retrieveFamilyService } from "@/hooks/services.ts";
import type { AxiosError } from "axios";
import type { ServerError } from "@/models/errors.ts";

export const useFamily = () => {
  const { user } = useUser();
  const {
    data: family,
    isLoading: isLoadingFamily,
    error,
  } = useQuery<Family, AxiosError<ServerError>>({
    queryKey: HooksQueryKeys.Family,
    queryFn: async () => {
      const response = await retrieveFamilyService();
      return response.data.family;
    },
    enabled: Boolean(user),
  });
  return { family, isLoadingFamily, error };
};
