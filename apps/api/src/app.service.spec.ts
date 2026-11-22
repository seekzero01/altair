import { AppService } from "./app.service.js";

describe("AppService", () => {
  it("should return the greeting", () => {
    const appService = new AppService();

    const greeting = appService.getHello();

    expect(greeting).toBe("Hello World!");
  });
});
