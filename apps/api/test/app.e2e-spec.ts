import { Test, TestingModule } from "@nestjs/testing";
import { Body, Controller, Post, type INestApplication } from "@nestjs/common";
import request from "supertest";
import { App } from "supertest/types.js";
import { AppModule } from "../src/app.module.js";
import { configureApi } from "../src/configure-api.js";

// A test-only DTO route exercises the same global pipe as production.
const nameSchema = {
  "~standard": {
    version: 1 as const,
    vendor: "altair-test",
    validate: (value: unknown) =>
      typeof value === "string" ? { value } : { issues: [{ message: "Expected a string" }] },
  },
};

@Controller("validation-test")
class ValidationTestController {
  @Post()
  submit(@Body("name", { schema: nameSchema }) name: string) {
    return { name };
  }
}

vi.mock("@nestjs/observe", async () => {
  const { Module } = await import("@nestjs/common");
  // oxlint-disable-next-line typescript/no-extraneous-class -- Nest modules require a class token.
  class MockObserveModule {}
  Module({})(MockObserveModule);
  return {
    createObserveModule: () => ({
      ObserveModule: { forRoot: () => ({ module: MockObserveModule }) },
      ObserveInstrument: {},
    }),
  };
});

describe("AppController (integration)", () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule.register(undefined)],
      controllers: [ValidationTestController],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureApi(app);
    await app.init();
  });

  it("should return the greeting through GET /api", () => {
    return request(app.getHttpServer()).get("/api").expect(200).expect("Hello World!");
  });

  it("should return minimal liveness data", () =>
    request(app.getHttpServer()).get("/api/health").expect(200, { status: "ok" }));

  it("should reject an invalid request field through the global pipe", () =>
    request(app.getHttpServer()).post("/api/validation-test").send({ name: 42 }).expect(400));

  it("should accept a valid request field", () =>
    request(app.getHttpServer())
      .post("/api/validation-test")
      .send({ name: "test" })
      .expect(201, { name: "test" }));

  afterEach(async () => {
    await app.close();
  });
});
