import { Module } from "@nestjs/common";
import { AdminController } from "./admin.controller";
import { AdminService } from "./admin.service";
import { GradesModule } from "../grades/grades.module";

@Module({
  imports: [GradesModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
