import { UserRole } from "./user.interface";

export interface IJWTPayload {
  userId: number;
  userRole: UserRole;
}
