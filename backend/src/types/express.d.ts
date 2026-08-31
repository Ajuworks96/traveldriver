import { UserTokenPayload } from '../utils/jwt.js';

declare global {
  namespace Express {
    interface Request {
      user?: UserTokenPayload;
      requestId?: string;
    }
  }
}

export {};
