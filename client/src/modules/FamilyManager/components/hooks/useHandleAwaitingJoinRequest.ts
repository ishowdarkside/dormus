import { useMutation, useQueryClient } from "@tanstack/react-query";
import { handleAwaitingJoinRequestService } from "@/modules/FamilyManager/services.ts";
import { FamilyManagerQueryKeys } from "@/modules/FamilyManager/queryKeys.ts";
import type { User } from "@/models/User.ts";

export const useHandleAwaitingJoinRequest = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: handleAwaitingJoinRequestService,
    onSuccess: (res, payload) => {
      if (res.data.status !== "success") return;

      const currentMembers = queryClient.getQueryData<User[]>(FamilyManagerQueryKeys.Users);
      if (!currentMembers) return;

      if (payload.action === "approve") {
        const updatedMembers = currentMembers.map((member) =>
          member.id === payload.user_id ? { ...member, date_joined: new Date() } : member,
        );

        queryClient.setQueryData(FamilyManagerQueryKeys.Users, updatedMembers);
      }

      if (payload.action === "decline") {
        const updatedMembers = currentMembers.filter((member) => member.id !== payload.user_id);
        queryClient.setQueryData(FamilyManagerQueryKeys.Users, updatedMembers);
        return;
      }
    },
  });

  return { handleAwaitingJoinRequestMutate: mutate, isPending };
};
