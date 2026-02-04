import type {
  IConsumeMagicToken,
  IJoinFamilyResponseModel,
  IRequestMagicTokenPayload,
  IRequestMagicTokenResponse,
  IValidatePhoneNumberPayload,
  IValidatePhoneNumberResponse,
  JoinOnboardingType,
  OnboardingResponse,
  OnboardingType,
} from "@/modules/Auth/types.ts";
import { api, ApiService } from "@/lib/api.ts";

export const registerUserFamilyService = async (data: OnboardingType) => {
  return await ApiService.post<OnboardingType, OnboardingResponse>(api.family, "", data);
};

export const validatePhoneNumberService = async (payload: IValidatePhoneNumberPayload) => {
  return await ApiService.post<IValidatePhoneNumberPayload, IValidatePhoneNumberResponse>(api.validators, "/phone-number", payload);
};

export const requestMagicToken = async (payload: IRequestMagicTokenPayload) => {
  return await ApiService.post<IRequestMagicTokenPayload, IRequestMagicTokenResponse>(api.auth, "/magic/request", payload);
};

export const consumeMagicToken = async () => {
  return await ApiService.get<IConsumeMagicToken>(api.auth, "/magic/consume");
};

export const joinFamilyService = async (payload: JoinOnboardingType) => {
  return await ApiService.post<JoinOnboardingType, IJoinFamilyResponseModel>(api.auth, "/family/join", payload);
};
