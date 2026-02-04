import type { User } from "@/models/User.ts";
import type { Family } from "@/models/Family.ts";

export interface IProtectRouteServiceResponse {
  user: User;
  status: string;
}

export interface IFamilyServiceResponse {
  status: string;
  family: Family;
}
