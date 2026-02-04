import { protectRouteService } from "@/hooks/services.ts";
import { useQuery } from "@tanstack/react-query";
import type { User } from "@/models/User.ts";
import { HooksQueryKeys } from "@/hooks/queryKeys.ts";
import { type AxiosError } from "axios";
import { useAuthToken } from "@/hooks/useAuthToken.ts";
import type { ServerError } from "@/models/errors.ts";

export const useUser = () => {
  const { token } = useAuthToken();
  const { data, isLoading, error } = useQuery<User, AxiosError<ServerError>>({
    queryKey: HooksQueryKeys.User,
    queryFn: async () => {
      const response = await protectRouteService();
      return response.data.user;
    },

    enabled: Boolean(token),
    retry: false,
  });

  return { user: data, isLoadingUser: isLoading, error };
};
