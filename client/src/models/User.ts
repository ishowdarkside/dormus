export type UserRole = "parent" | "child";
export type UserGender = "male" | "female";

export const USER_ROLE = {
  Parent: "parent",
  Child: "child",
};

export interface User {
  id: number;
  family_id: number;
  created_at: Date;
  updated_at?: Date;
  version: number;
  role: UserRole;
  phone_number: string;
  email: string;
  age: number;
  gender: UserGender;
  name: string;
  region: string;
  last_seen?: Date;
  date_joined?: Date;
}
