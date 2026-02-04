import { type ReactNode } from "react";
import { Navigate } from "react-router";
import { PATHS } from "@/router/paths.ts";
import { LoadingSpinner } from "@/components";
import { useAuthToken, useUser } from "@/hooks";

interface IPropTypes {
  children: ReactNode;
  protect: "App" | "Auth" | "Waitlist";
}

export const ProtectRoute = ({ children, protect }: IPropTypes) => {
  const { user, isLoadingUser } = useUser();
  const { token, isRetrievingToken } = useAuthToken();

  if (token && !user && protect == "Waitlist") return children;
  if (!token && !isRetrievingToken && protect === "Waitlist") return <Navigate to={PATHS.Auth} />;

  if ((!token && !isRetrievingToken) || (!isLoadingUser && !user)) {
    if (protect == "App") return <Navigate to={PATHS.Auth} />;
    else return children;
  }

  if (isLoadingUser || isRetrievingToken)
    return (
      <div className="w-full h-full flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );

  //User exists, proceed
  if (protect === "Auth") return <Navigate to={PATHS.App} />;
  if (protect === "Waitlist") return <Navigate to={PATHS.App} />;
  return children;
};
