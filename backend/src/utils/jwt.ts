import jwt, { JwtPayload } from "jsonwebtoken";
import { env } from "../config/env";
import { UserRole } from "../models/User";

export type AuthTokenPayload = {
  userId: string;
  role: UserRole;
};

export const signAuthToken = (payload: AuthTokenPayload): string => {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: "7d" });
};

export const verifyAuthToken = (
  token: string
): (AuthTokenPayload & JwtPayload) => {
  return jwt.verify(token, env.JWT_SECRET) as AuthTokenPayload & JwtPayload;
};
