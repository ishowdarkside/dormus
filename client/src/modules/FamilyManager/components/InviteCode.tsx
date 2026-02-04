import { useTranslation } from "react-i18next";
import { Button, Input } from "@/components";
import { useRefreshInviteToken } from "@/modules/FamilyManager/hooks";
import { ArrowsClockwise } from "phosphor-react";
import { useFamily } from "@/hooks";

export const InviteCode = () => {
  const { isPending, refreshTokenMutate } = useRefreshInviteToken();
  const { family } = useFamily();
  const { t } = useTranslation();
  return (
    <div className="flex items-center justify-between mt-6">
      <div className="flex justify-between items-center w-full gap-1.5">
        <span className="font-light">{t("invite_code")}</span>
        <div className="flex gap-1">
          <Input value={family?.invite_token} readOnly />
          <Button variant="secondary" disabled={isPending} onClick={() => refreshTokenMutate()}>
            <ArrowsClockwise />
          </Button>
        </div>
      </div>
    </div>
  );
};
