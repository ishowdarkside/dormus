import { useTranslation } from "react-i18next";
import { Button, Input, LoadingSpinner } from "@/components";
import { ActiveFamilyUsersTable, AwaitingFamilyUsersTable, InviteCode } from "@/modules/FamilyManager/components";
import { useFamilyMembers } from "@/modules/FamilyManager/hooks";
import { useChangeFamilyName } from "@/modules/FamilyManager/hooks/useChangeFamilyName.ts";

export const FamilyManager = () => {
  const { t } = useTranslation();
  const { familyMembers, isLoadingFamilyMembers } = useFamilyMembers();
  const { changeFamilyNameMutation, isPending, handleInputChange, inputValue } = useChangeFamilyName();

  const awaitingFamilyMember = familyMembers?.filter((member) => !member.date_joined);
  const activeFamilyMembers = familyMembers?.filter((member) => Boolean(member.date_joined));

  if (isLoadingFamilyMembers) return <LoadingSpinner />;

  return (
    <div className="mx-auto">
      <h2 className="text-3xl mb-8">{t("family_center")}</h2>
      <div className="flex gap-2">
        <Input value={inputValue} placeholder="family_name" onChange={handleInputChange} />
        <Button disabled={isPending} className="bg-cinco" onClick={() => changeFamilyNameMutation()}>
          {t("save")}
        </Button>
      </div>
      <InviteCode />

      <div className="mt-16 flex flex-col gap-16">
        <AwaitingFamilyUsersTable awaitingFamilyMember={awaitingFamilyMember} />
        <ActiveFamilyUsersTable activeFamilyMembers={activeFamilyMembers} />
      </div>
    </div>
  );
};
