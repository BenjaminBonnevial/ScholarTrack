import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { RolesGuard } from "./guards/roles.guard";
import { SessionGuard } from "./guards/session.guard";

@Module({
  controllers: [AuthController],
  providers: [SessionGuard, RolesGuard],
  exports: [SessionGuard, RolesGuard],
})
export class AuthModule {}
