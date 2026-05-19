import type { AuthSessionData } from "../auth/auth.types";

declare global {
  namespace Express {
    interface Request {
      auth?: AuthSessionData;
    }
  }
}

export {};
