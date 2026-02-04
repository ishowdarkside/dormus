import { useMutation, useQueryClient } from "@tanstack/react-query";
import { refreshInviteTokenService } from "@/modules/FamilyManager/services.ts";
import { HooksQueryKeys } from "@/hooks/queryKeys.ts";
import type { Family } from "@/models/Family.ts";

export const useRefreshInviteToken = () => {
  const queryClient = useQueryClient();
  const { mutate: refreshTokenMutate, isPending } = useMutation({
    mutationFn: refreshInviteTokenService,
    onSuccess: (res) => {
      const family = queryClient.getQueryData(HooksQueryKeys.Family);
      if (!family) return;
      queryClient.setQueryData<Family>(HooksQueryKeys.Family, (family) => {
        if (!family) return;
        return { ...family, invite_token: res.data.invite_token };
      });
    },
  });

  return { refreshTokenMutate, isPending };
};
