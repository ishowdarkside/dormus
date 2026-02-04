import { useQuery, useQueryClient } from "@tanstack/react-query";
import { HooksQueryKeys } from "@/hooks/queryKeys.ts";
import { useNavigate } from "react-router";
import { PATHS } from "@/router/paths.ts";

const TOKEN_EXPIRES_7DAYS = 7 * 24 * 60 * 60 * 1000;

export const useAuthToken = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: token, isLoading: isRetrievingToken } = useQuery<string | undefined>({
    queryKey: HooksQueryKeys.Token,
    queryFn: async () => {
      const token = await cookieStore.get("token");
      return token?.value ?? "";
    },
  });

  const handleAuthTokenSet = async (input: string) => {
    await cookieStore.set({ name: "token", value: input, expires: Date.now() + TOKEN_EXPIRES_7DAYS });
    queryClient.setQueryData(HooksQueryKeys.Token, input);
  };

  const handleAuthTokenRemove = async ({ redirectToAuth }: { redirectToAuth?: boolean }) => {
    await cookieStore.delete("token");
    queryClient.removeQueries({ queryKey: HooksQueryKeys.Token });
    if (redirectToAuth) navigate(PATHS.Auth);
  };

  return { token, isRetrievingToken, handleAuthTokenSet, handleAuthTokenRemove };
};
