import jwt, { SignOptions } from 'jsonwebtoken';
import { ENV } from '../config/env.js';
import { Role } from '@prisma/client';

export interface UserTokenPayload {
  userId: string;
  email: string;
  role: Role;
}

export const generateAccessToken = (payload: UserTokenPayload): string => {
  const options: SignOptions = {
    expiresIn: ENV.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  };
  return jwt.sign(payload, ENV.JWT_SECRET, options);
};

export const generateRefreshToken = (payload: UserTokenPayload): string => {
  const options: SignOptions = {
    expiresIn: ENV.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  };
  return jwt.sign(payload, ENV.JWT_REFRESH_SECRET, options);
};

export const verifyAccessToken = (token: string): UserTokenPayload => {
  return jwt.verify(token, ENV.JWT_SECRET) as UserTokenPayload;
};

export const verifyRefreshToken = (token: string): UserTokenPayload => {
  return jwt.verify(token, ENV.JWT_REFRESH_SECRET) as UserTokenPayload;
};
