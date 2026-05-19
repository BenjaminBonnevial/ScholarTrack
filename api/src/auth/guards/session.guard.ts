import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { fromNodeHeaders } from "better-auth/node";
import type { Request } from "express";
import { auth } from "../../auth";

@Injectable()
export class SessionGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const headers = fromNodeHeaders(req.headers);
    const session = await auth.api.getSession({ headers });

    if (!session) {
      throw new UnauthorizedException("Authentication required.");
    }

    req.auth = session;
    return true;
  }
}
