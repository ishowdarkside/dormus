import { api, ApiService } from "@/lib/api.ts";
import type { IFamilyServiceResponse, IProtectRouteServiceResponse } from "@/hooks/types.ts";

export const protectRouteService = async () => {
  return await ApiService.get<IProtectRouteServiceResponse>(api.auth, "/me");
};

export const retrieveFamilyService = async () => {
  return await ApiService.get<IFamilyServiceResponse>(api.family);
};
