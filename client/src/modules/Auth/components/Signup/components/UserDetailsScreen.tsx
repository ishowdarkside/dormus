import { Button, FormDropdown, FormInput, RegionPicker } from "@/components";
import type { OnboardingType } from "@/modules/Auth/types.ts";
import { useTranslation } from "react-i18next";
import { useRegisterUserMutation, useUserDetailsScreen } from "@/modules/Auth/components/Signup/hooks";
import { useFormContext } from "react-hook-form";
import { emailRegex } from "@/utils/common.ts";

interface PropTypes {
  onNavigateBack: VoidFunction;
}

export const UserDetailsScreen = ({ onNavigateBack }: PropTypes) => {
  const { t } = useTranslation();
  const {
    handleSubmit,
    formState: { errors },
  } = useFormContext<OnboardingType>();

  const { genderOptions, roleOptions, handleRegionChange, handlePhoneNumberChange } = useUserDetailsScreen();
  const { mutateAsync, handleErrors } = useRegisterUserMutation();

  return (
    <>
      <h2 className="text-[32px] mb-6">{t("few_details_about_you")}</h2>

      <div className="flex flex-col gap-3">
        <FormInput<OnboardingType> name="name" placeholder={t("your_name")} />
        <FormInput<OnboardingType> name="age" type="number" placeholder={t("age")} />
        <FormDropdown<OnboardingType> trigger={t("gender")} options={genderOptions} name="gender" />
        <FormDropdown<OnboardingType> trigger={t("role")} options={roleOptions} name="role" />
        <FormInput<OnboardingType> name="email" type="email" placeholder={t("email")} regex={emailRegex} />
        <RegionPicker
          error={Boolean(errors.phone_number) || Boolean(errors.region)}
          handleSelectRegion={handleRegionChange}
          handlePhoneNumber={handlePhoneNumberChange}
        />
      </div>
      <div className="flex gap-2 mt-6">
        <Button onClick={onNavigateBack} variant="outline" className="flex-1">
          {t("back")}
        </Button>
        <Button
          className="flex-1"
          onClick={handleSubmit(
            (data) => mutateAsync(data),
            (data) => handleErrors(data),
          )}
        >
          {t("continue")}
        </Button>
      </div>
    </>
  );
};
