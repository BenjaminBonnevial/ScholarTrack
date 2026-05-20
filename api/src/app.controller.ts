import { Controller, Get, Req } from "@nestjs/common";
import type { Request } from "express";
import { AppService } from "./app.service";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
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
