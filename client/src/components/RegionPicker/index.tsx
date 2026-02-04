import type { CountryData } from "country-codes-list";
import * as countryCodes from "country-codes-list";
import { useMemo, useState } from "react";
import { Button, Dropdown, Input } from "@/components";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils.ts";

interface PropTypes {
  handleSelectRegion: (e: string) => void;
  handlePhoneNumber: (e: string) => void;
  error?: boolean;
}

export const RegionPicker = ({ handleSelectRegion, handlePhoneNumber, error }: PropTypes) => {
  const { t } = useTranslation();
  const [selectedRegion, setSelectedRegion] = useState<Partial<CountryData> | null>(null);
  const data = useMemo(() => countryCodes?.all(), []);

  const options = useMemo(
    () =>
      data?.map((e) => ({
        label: `${e.flag} ${e.countryNameLocal}`,
        value: e.countryCallingCode,
        handler: () => {
          handleSelectRegion(e.countryCode);
          setSelectedRegion({
            flag: e.flag,
            countryCallingCode: e.countryCallingCode,
          });
        },
      })),
    [],
  );

  return (
    <div className="flex">
      <Dropdown
        trigger={
          <Button variant="outline" className={cn("rounded-r-none border-r-0", error && "border-destructive bg-red-50 text-destructive")}>
            {selectedRegion ? (
              <div className="flex items-center gap-3">
                <span>{selectedRegion.flag}</span>
                <span>+{selectedRegion.countryCallingCode}</span>
              </div>
            ) : (
              t("select_region")
            )}
          </Button>
        }
        options={options}
      />
      <Input
        type="number"
        className={cn("rounded-l-none", error && "bg-red-50 border-destructive text-destructive")}
        disabled={!Boolean(selectedRegion)}
        onChange={(e) => {
          handlePhoneNumber(`${selectedRegion?.countryCallingCode}${e.target.value}`);
        }}
      />
    </div>
  );
};
