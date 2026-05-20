import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { Request } from "express";
import { ROLES_KEY } from "../decorators/roles.decorator";
import type { Role } from "../auth.constants";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const req = context.switchToHttp().getRequest<Request>();
    const authSession = req.auth;

    if (!authSession) {
      throw new UnauthorizedException("Authentication required.");
    }

    const role = (
      (authSession as { role?: Role }).role ??
      ((authSession.user as { role?: Role } | undefined)?.role)
    ) as Role | undefined;

    if (!role || !requiredRoles.includes(role)) {
      throw new ForbiddenException("Insufficient role.");
    }

    return true;
  }
}
