import type { UserGender, UserRole } from "@/models/User.ts";

export const ACTIVE_SCREEN = {
  Register: 0,
  Login: 1,
  Join: 2,
};

export interface OnboardingType {
  family_name: string;
  age: number;
  gender: UserGender;
  name: string;
  email: string;
  role: UserRole;
  phone_number: string;
  region: string;
}

export interface OnboardingResponse {
  status: string;
  message: string;
  token: string;
}

export interface JoinOnboardingType {
  invite_token: string;
  age: number;
  gender: UserGender;
  name: string;
  email: string;
  role: UserRole;
  phone_number: string;
  region: string;
}

export const JOIN_ACTIVE_SCREEN = {
  InviteCode: 0,
  UserDetails: 1,
};

export interface IValidatePhoneNumberPayload {
  phone_number: string;
  region: string | null;
}

export interface IValidatePhoneNumberResponse {
  is_valid: boolean;
  status: string;
}

export interface IRequestMagicTokenPayload {
  region?: string | null;
  identifier: string;
  lang: string | null;
}

export interface IRequestMagicTokenResponse {
  status: string;
}

export interface IJoinFamilyResponseModel {
  status: string;
  message: string;
  token?: string;
}

export interface IConsumeMagicToken {
  status: string;
  token: string;
}
