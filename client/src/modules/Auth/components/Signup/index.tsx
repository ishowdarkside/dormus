import { Form } from "@/components";
import { type OnboardingType } from "@/modules/Auth/types.ts";
import { useState } from "react";
import { FamilyNameScreen } from "@/modules/Auth/components/Signup/components/FamilyNameScreen.tsx";
import { UserDetailsScreen } from "@/modules/Auth/components/Signup/components/UserDetailsScreen.tsx";

const ActiveScreens = {
  FamilyName: 0,
  UserDetails: 1,
};

interface PropTypes {
  onNavigateToJoinScreen: VoidFunction;
}

export const Signup = ({ onNavigateToJoinScreen }: PropTypes) => {
  const [activeScreen, setActiveScreen] = useState(ActiveScreens.FamilyName);

  const navigateBack = () => setActiveScreen(ActiveScreens.FamilyName);
  const navigateToNextScreen = () => setActiveScreen(ActiveScreens.UserDetails);

  return (
    <Form<OnboardingType>>
      <div className="max-w-113 mx-auto  h-full flex items-center">
        <div className="flex-1">
          {activeScreen === ActiveScreens.FamilyName && (
            <FamilyNameScreen onNavigateNext={navigateToNextScreen} onNavigateToLogin={onNavigateToJoinScreen} />
          )}
          {activeScreen === ActiveScreens.UserDetails && <UserDetailsScreen onNavigateBack={navigateBack} />}
        </div>
      </div>
    </Form>
  );
};
