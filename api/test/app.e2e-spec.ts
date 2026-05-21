import { INestApplication, Module, NestModule, MiddlewareConsumer, RequestMethod } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { Request, Response, NextFunction } from "express";
import request from "supertest";
import { App } from "supertest/types";
import { AppController } from "../src/app.controller";
import { AppService } from "../src/app.service";
import { EnrollmentsController } from "../src/enrollments/enrollments.controller";
import { EnrollmentsService } from "../src/enrollments/enrollments.service";
import { RateLimitMiddleware } from "../src/common/middleware/rate-limit.middleware";

@Module({
  controllers: [AppController, EnrollmentsController],
  providers: [
    AppService,
    // EnrollmentsService is only needed for DI; capacity-check uses the pipe, not the service
    { provide: EnrollmentsService, useValue: {} },
  ],
})
class IntegrationTestModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(new RateLimitMiddleware()).forRoutes({
      path: "*",
      method: RequestMethod.ALL,
    });
  }
}

describe("AppController (e2e)", () => {
  let app: INestApplication<App>;
  const previousRateLimitMax = process.env.RATE_LIMIT_MAX_REQUESTS;
  const previousRateLimitWindow = process.env.RATE_LIMIT_WINDOW_MS;

  beforeAll(async () => {
    process.env.RATE_LIMIT_MAX_REQUESTS = "1";
    process.env.RATE_LIMIT_WINDOW_MS = "60000";

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [IntegrationTestModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    const rateLimitMiddleware = new RateLimitMiddleware();
    app.use((req: Request, res: Response, next: NextFunction) =>
      rateLimitMiddleware.use(req, res, next),
    );
    await app.init();
  });

  it("returns the public root route", async () => {
    await request(app.getHttpServer())
      .get("/")
      .set("x-forwarded-for", "10.0.0.1")
      .expect(200)
      .expect("Hello World!");
  });

  it("enforces the global rate limit", async () => {
    await request(app.getHttpServer())
      .get("/")
      .set("x-forwarded-for", "10.0.0.2")
      .expect(200);

    await request(app.getHttpServer())
      .get("/")
      .set("x-forwarded-for", "10.0.0.2")
      .expect(429)
      .expect({
        message: "Too many requests. Please slow down.",
        statusCode: 429,
      });
  });

  it("rejects capacity checks when the course is full", async () => {
    await request(app.getHttpServer())
      .post("/enrollments/capacity-check")
      .set("x-forwarded-for", "10.0.0.3")
      .send({ capacity: 10, enrolledCount: 10 })
      .expect(400)
      .expect({
        message: "Course capacity has been reached.",
        error: "Bad Request",
        statusCode: 400,
      });
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }

    if (previousRateLimitMax === undefined) {
      delete process.env.RATE_LIMIT_MAX_REQUESTS;
    } else {
      process.env.RATE_LIMIT_MAX_REQUESTS = previousRateLimitMax;
    }

    if (previousRateLimitWindow === undefined) {
      delete process.env.RATE_LIMIT_WINDOW_MS;
    } else {
      process.env.RATE_LIMIT_WINDOW_MS = previousRateLimitWindow;
    }
  });
});
