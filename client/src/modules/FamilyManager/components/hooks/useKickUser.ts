import { useMutation, useQueryClient } from "@tanstack/react-query";
import { kickUserService } from "@/modules/FamilyManager/services.ts";
import { SERVER_RESPONSE_STATUS } from "@/utils/common.ts";
import { useFamilyMembers } from "@/modules/FamilyManager/hooks";
import { FamilyManagerQueryKeys } from "@/modules/FamilyManager/queryKeys.ts";

export const useKickUser = () => {
  const { familyMembers } = useFamilyMembers();
  const queryClient = useQueryClient();

  const { mutateAsync: kickUserMutateAsync, isPending: isKickingUser } = useMutation({
    mutationFn: kickUserService,
    onSuccess: (res, payload) => {
      if (res.data.status !== SERVER_RESPONSE_STATUS.Success) return;
      if (!familyMembers?.length) return;

      const updatedFamilyMembers = familyMembers.filter((member) => member.id !== payload.user_id);
      queryClient.setQueryData(FamilyManagerQueryKeys.Users, updatedFamilyMembers);
    },
  });
  return { kickUserMutateAsync, isKickingUser };
};
