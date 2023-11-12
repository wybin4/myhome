import { UserRole } from "./user.interface";

export interface IJWTPayload {
  id: number;
  userRole: UserRole;
}
