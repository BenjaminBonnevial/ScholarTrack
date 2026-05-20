import { HttpException, HttpStatus, Injectable, NestMiddleware } from "@nestjs/common";
import type { NextFunction, Request, Response } from "express";

type RateLimitWindow = {
  count: number;
  resetAt: number;
};

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  private readonly windows = new Map<string, RateLimitWindow>();

  constructor(
    private readonly maxRequests = Number(process.env.RATE_LIMIT_MAX_REQUESTS ?? 100),
    private readonly windowMs = Number(process.env.RATE_LIMIT_WINDOW_MS ?? 60_000),
  ) {}

  use(req: Request, res: Response, next: NextFunction): void {
    const forwardedFor = req.headers["x-forwarded-for"]?.toString();
    const key = forwardedFor || req.ip || "anonymous";
    const now = Date.now();
    const existingWindow = this.windows.get(key);

    if (!existingWindow || existingWindow.resetAt <= now) {
      this.windows.set(key, { count: 1, resetAt: now + this.windowMs });
      next();
      return;
    }

    if (existingWindow.count >= this.maxRequests) {
      throw new HttpException(
        "Too many requests. Please slow down.",
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    existingWindow.count += 1;
    this.windows.set(key, existingWindow);
    next();
  }
}
