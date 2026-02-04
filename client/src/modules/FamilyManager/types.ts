import type { User } from "@/models/User.ts";

export interface IChangeFamilyNamePayload {
  name: string;
}

export interface IChangeFamilyNameResponse {
  status: string;
  message: string;
}

export interface IHandleAwaitingJoinRequestPayload {
  user_id: number;
  action: "approve" | "decline";
}

export interface IHandleAwaitingJoingRequestResponse {
  status: string;
  message: string;
}

export interface IFamilyMembersRsponse {
  status: string;
  users: User[];
}

export interface IRefreshInviteTokenResponse {
  status: string;
  invite_token: string;
}

export interface IKickUserPayload {
  user_id: number;
}

export interface IKickUserResponse {
  status: string;
  message: string;
}
