import { HttpException, HttpStatus } from "@nestjs/common";
import type { NextFunction, Request, Response } from "express";
import { RateLimitMiddleware } from "./rate-limit.middleware";

describe("RateLimitMiddleware", () => {
  it("allows requests under the limit", () => {
    const middleware = new RateLimitMiddleware(2, 1_000);
    const req = { ip: "127.0.0.1", headers: {} } as Request;
    const res = {} as Response;
    const next = jest.fn() as NextFunction;

    middleware.use(req, res, next);
    middleware.use(req, res, next);

    expect(next).toHaveBeenCalledTimes(2);
  });

  it("throws when the limit is exceeded", () => {
    const middleware = new RateLimitMiddleware(1, 1_000);
    const req = { ip: "127.0.0.1", headers: {} } as Request;
    const res = {} as Response;
    const next = jest.fn() as NextFunction;

    middleware.use(req, res, next);

    expect(() => middleware.use(req, res, next)).toThrow(HttpException);
    expect(() => middleware.use(req, res, next)).toThrow(
      expect.objectContaining({
        message: "Too many requests. Please slow down.",
      }),
    );
    expect(next).toHaveBeenCalledTimes(1);
  });
});
