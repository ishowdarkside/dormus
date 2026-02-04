import type { User } from "@/models/User.ts";

export const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
export const textRegex = /[a-zA-Z]/;

export const HTTP_STATUS = {
  Unauthorized: 401,
  OK: 200,
  Created: 201,
  NoContent: 204,
  BadRequest: 400,
  NotFound: 405,
  TooManyRequests: 429,
};

export const SERVER_RESPONSE_STATUS = {
  Success: "success",
  Error: "error",
  Fail: "fail",
};

export const findFamilyMemberById = (id: number, users: User[] | undefined) => {
  return users?.find((e) => e.id === id);
};
