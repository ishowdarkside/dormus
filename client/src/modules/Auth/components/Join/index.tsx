import { Form } from "@/components";
import { JOIN_ACTIVE_SCREEN, type JoinOnboardingType } from "@/modules/Auth/types.ts";
import { OnboardingInviteCode } from "@/modules/Auth/components/Join/OnboardingInviteCode";
import { useState } from "react";
import { UserDetails } from "@/modules/Auth/components/Join/UserDetails";

interface IJoinProps {
  onNavigateBack: VoidFunction;
  onNavigateToLoginScreen: VoidFunction;
}

export const Join = ({ onNavigateBack, onNavigateToLoginScreen }: IJoinProps) => {
  const [activeScreen, setActiveScreen] = useState(JOIN_ACTIVE_SCREEN.InviteCode);

  const navigateToInviteCode = () => setActiveScreen(JOIN_ACTIVE_SCREEN.InviteCode);
  const navigateToUserDetails = () => setActiveScreen(JOIN_ACTIVE_SCREEN.UserDetails);

  return (
    <div className="max-w-113 mx-auto w-full   h-full flex items-center">
      <Form<JoinOnboardingType>>
        {activeScreen === JOIN_ACTIVE_SCREEN.InviteCode && (
          <OnboardingInviteCode
            onNavigateBack={onNavigateBack}
            onNavigateToLoginScreen={onNavigateToLoginScreen}
            onNavigateNext={navigateToUserDetails}
          />
        )}

        {activeScreen === JOIN_ACTIVE_SCREEN.UserDetails && <UserDetails onNavigateBack={navigateToInviteCode} />}
      </Form>
    </div>
  );
};
