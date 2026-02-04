import { useQuery } from "@tanstack/react-query";
import { FamilyManagerQueryKeys } from "@/modules/FamilyManager/queryKeys.ts";
import { retrieveFamilyMembersService } from "@/modules/FamilyManager/services.ts";
import type { User } from "@/models/User.ts";
import type { AxiosError } from "axios";
import type { ServerError } from "@/models/errors.ts";

export const useFamilyMembers = () => {
  const { data: familyMembers, isLoading: isLoadingFamilyMembers } = useQuery<User[], AxiosError<ServerError>>({
    queryKey: FamilyManagerQueryKeys.Users,
    queryFn: async () => {
      const response = await retrieveFamilyMembersService();
      return response.data.users;
    },
  });

  return { familyMembers, isLoadingFamilyMembers };
};

export const useFindFamilyMemberById = (id: number | undefined) => {
  const { familyMembers } = useFamilyMembers();
  return familyMembers?.find((e) => e.id === id);
};
