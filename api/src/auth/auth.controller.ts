import { Controller, All, Req, Res } from "@nestjs/common";
import { toNodeHandler } from "better-auth/node";
import type { Request, Response } from "express";
import { auth } from "../auth";
import { Public } from "./decorators/roles.decorator";

@Controller()
export class AuthController {
  private readonly handler = toNodeHandler(auth);

  @All(["api/auth", "api/auth/*path"])
  @Public()
  async handle(@Req() req: Request, @Res() res: Response): Promise<void> {
    await this.handler(req, res);
  }
}
