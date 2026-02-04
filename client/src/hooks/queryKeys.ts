export const HooksQueryKeys = {
  User: [{ component: "ProtectRoute", params: { name: "user", type: "remote" } }] as const,
  Token: [{ component: "App", params: { name: "token", type: "local" } }] as const,
  Family: [{ component: "App", params: { name: "family", type: "remote" } }] as const,
};
