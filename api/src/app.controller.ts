import { Controller, Get, Req } from "@nestjs/common";
import type { Request } from "express";
import { AppService } from "./app.service";
import { Public } from "./auth/decorators/roles.decorator";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Public()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get("protected")
  getProtected(@Req() request: Request) {
    return {
      message: "Authenticated access granted.",
      session: request.auth,
    };
  }
}
