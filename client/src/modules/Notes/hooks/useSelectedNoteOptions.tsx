import { useTranslation } from "react-i18next";
import { Pen, Trash } from "phosphor-react";

export const useSelectedNoteOptions = () => {
  const { t } = useTranslation();

  const options = [
    {
      label: t("edit"),
      icon: <Pen />,
    },
    {
      label: t("delete"),
      icon: <Trash />,
    },
  ];

  return { options };
};
