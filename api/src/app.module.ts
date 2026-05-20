import { Module, MiddlewareConsumer, NestModule, RequestMethod } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { AuthModule } from "./auth/auth.module";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AdminModule } from "./admin/admin.module";
import { AttendanceModule } from "./attendance/attendance.module";
import { CoursesModule } from "./courses/courses.module";
import { EnrollmentsModule } from "./enrollments/enrollments.module";
import { GradesModule } from "./grades/grades.module";
import { SemestersModule } from "./semesters/semesters.module";
import { RolesGuard } from "./auth/guards/roles.guard";
import { SessionGuard } from "./auth/guards/session.guard";
import { RateLimitMiddleware } from "./common/middleware/rate-limit.middleware";
import { UsersModule } from "./users/users.module";
import { PrismaModule } from "./prisma/prisma.module";

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsersModule,
    CoursesModule,
    SemestersModule,
    EnrollmentsModule,
    GradesModule,
    AttendanceModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: SessionGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RateLimitMiddleware).forRoutes({
      path: "*",
      method: RequestMethod.ALL,
    });
  }
}
