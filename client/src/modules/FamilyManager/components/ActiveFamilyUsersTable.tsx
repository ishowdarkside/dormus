import { AvatarFromFirstName, Button, Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components";
import { useTranslation } from "react-i18next";
import { type User, USER_ROLE } from "@/models/User.ts";
import { format } from "date-fns";
import { useUser } from "@/hooks";
import { useKickUser } from "@/modules/FamilyManager/components/hooks/useKickUser.ts";

interface IActiveFamilyUsersTableProps {
  activeFamilyMembers: User[] | undefined;
}

export const ActiveFamilyUsersTable = ({ activeFamilyMembers }: IActiveFamilyUsersTableProps) => {
  const { t } = useTranslation();
  const { user } = useUser();
  const { kickUserMutateAsync, isKickingUser } = useKickUser();

  if (activeFamilyMembers?.length === 0) return null;
  return (
    <Table>
      <TableCaption>{t("active_users")}</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>{t("name")}</TableHead>
          <TableHead>{t("email")}</TableHead>
          <TableHead>{t("phone_number")}</TableHead>
          <TableHead>{t("date_joined")}</TableHead>
          <TableHead>{t("role")}</TableHead>
          <TableHead className="text-right">{t("actions")}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {activeFamilyMembers?.map((member) => (
          <TableRow key={member.id}>
            <TableCell className="flex items-center gap-2">
              <AvatarFromFirstName firstname={member.name} />
              {member.name}
            </TableCell>
            <TableCell>{member.email}</TableCell>
            <TableCell>{member.phone_number}</TableCell>
            <TableCell>{format(member.date_joined ?? "", "dd MMM yyyy")}</TableCell>
            <TableCell>{t(member.role)}</TableCell>
            <TableCell className="justify-end flex">
              {user?.id !== member.id && user?.role === USER_ROLE.Parent && (
                <Button
                  disabled={isKickingUser}
                  className="bg-seis"
                  onClick={async () => await kickUserMutateAsync({ user_id: member.id })}
                >
                  {t("remove")}
                </Button>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
