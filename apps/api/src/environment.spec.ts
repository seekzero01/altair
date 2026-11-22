import { readEnvironment } from "./environment.js";

describe("API environment", () => {
  it("should default to local operation", () => {
    expect(readEnvironment({})).toEqual({ port: 3001 });
  });

  it.each(["1", "65535"])("should accept boundary port %s", (port) => {
    expect(readEnvironment({ PORT: port }).port).toBe(Number(port));
  });

  it.each(["", "-1", "0", "65536", "3.5", "socket"])("should reject invalid PORT %j", (PORT) => {
    expect(() => readEnvironment({ PORT })).toThrow("PORT must be an integer");
  });

  it("should require a complete Observe credential pair", () => {
    expect(() => readEnvironment({ OBSERVE_APP_SECRET: "test-secret" })).toThrow("Set both");
  });

  it("should reject padded credentials without printing them", () => {
    const environment = { OBSERVE_APP_KEY: "key", OBSERVE_APP_SECRET: " secret " };
    const read = () => readEnvironment(environment);
    expect(read).toThrow("without surrounding whitespace");
    expect(read).not.toThrow(" secret ");
  });

  it("should enable Observe with an explicit port and credential pair", () => {
    expect(
      readEnvironment({ PORT: "4100", OBSERVE_APP_KEY: "key", OBSERVE_APP_SECRET: "secret" }),
    ).toEqual({ port: 4100, observe: { appKey: "key", appSecret: "secret", serviceId: "api" } });
  });
});
