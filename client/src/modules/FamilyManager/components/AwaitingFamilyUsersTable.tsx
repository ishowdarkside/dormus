import {
  AvatarFromFirstName,
  Button,
  Dropdown,
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components";
import { useTranslation } from "react-i18next";
import type { User } from "@/models/User.ts";
import { format } from "date-fns";
import { Check, DotsThree, X } from "phosphor-react";
import { useHandleAwaitingJoinRequest } from "@/modules/FamilyManager/components/hooks/useHandleAwaitingJoinRequest.ts";

interface IAwaitingFamilyUsersTableProps {
  awaitingFamilyMember: User[] | undefined;
}

export const AwaitingFamilyUsersTable = ({ awaitingFamilyMember }: IAwaitingFamilyUsersTableProps) => {
  const { t } = useTranslation();
  const { handleAwaitingJoinRequestMutate, isPending } = useHandleAwaitingJoinRequest();

  if (awaitingFamilyMember?.length === 0) return null;
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t("name")}</TableHead>
          <TableHead>{t("email")}</TableHead>
          <TableHead>{t("phone_number")}</TableHead>
          <TableHead>{t("date_requested")}</TableHead>
          <TableHead>{t("role")}</TableHead>
          <TableHead className="text-right">{t("actions")}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {awaitingFamilyMember?.map((member) => (
          <TableRow key={member.id}>
            <TableCell className="flex items-center gap-2">
              <AvatarFromFirstName firstname={member.name} />
              {member.name}
            </TableCell>
            <TableCell>{member.email}</TableCell>
            <TableCell>{member.phone_number}</TableCell>
            <TableCell>{format(member.created_at, "dd MMM yyyy")}</TableCell>
            <TableCell>{t(member.role)}</TableCell>
            <TableCell className="justify-end flex">
              <Dropdown
                trigger={
                  <Button variant="ghost" disabled={isPending}>
                    <DotsThree size={24} className="cursor-pointer" />
                  </Button>
                }
                options={[
                  {
                    label: t("accept"),
                    value: t("accept"),
                    icon: <Check />,
                    handler: () => handleAwaitingJoinRequestMutate({ action: "approve", user_id: member.id }),
                  },
                  {
                    label: t("decline"),
                    value: t("decline"),
                    icon: <X />,
                    handler: () => handleAwaitingJoinRequestMutate({ action: "decline", user_id: member.id }),
                  },
                ]}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableCaption>
        <span className="block">{t("waiting_approval")}</span>
      </TableCaption>
    </Table>
  );
};
