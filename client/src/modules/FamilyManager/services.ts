import { api, ApiService } from "@/lib/api.ts";
import type {
  IChangeFamilyNamePayload,
  IChangeFamilyNameResponse,
  IFamilyMembersRsponse,
  IHandleAwaitingJoingRequestResponse,
  IHandleAwaitingJoinRequestPayload,
  IKickUserPayload,
  IKickUserResponse,
  IRefreshInviteTokenResponse,
} from "@/modules/FamilyManager/types.ts";

export const refreshInviteTokenService = async () => {
  return await ApiService.post<void, IRefreshInviteTokenResponse>(api.family, "/refresh_token", undefined);
};

export const retrieveFamilyMembersService = async () => {
  return await ApiService.get<IFamilyMembersRsponse>(api.users);
};

export const handleAwaitingJoinRequestService = async (data: IHandleAwaitingJoinRequestPayload) => {
  return await ApiService.post<IHandleAwaitingJoinRequestPayload, IHandleAwaitingJoingRequestResponse>(
    api.auth,
    "/family/handle_request",
    data,
  );
};

export const changeFamilyNameService = async (payload: IChangeFamilyNamePayload) => {
  return await ApiService.post<IChangeFamilyNamePayload, IChangeFamilyNameResponse>(api.family, "/update_name", payload);
};

export const kickUserService = async (data: IKickUserPayload) => {
  return await ApiService.post<IKickUserPayload, IKickUserResponse>(api.auth, "/kick_member", data);
};
