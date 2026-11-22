import { NestFactory } from "@nestjs/core";
import { AppModule, ObserveInstrument } from "./app.module.js";
import { configureApi } from "./configure-api.js";
import { readEnvironment } from "./environment.js";

async function bootstrap() {
  const { port, observe } = readEnvironment(process.env);
  const app = await NestFactory.create(
    AppModule.register(observe),
    observe ? { instrument: ObserveInstrument } : {},
  );
  configureApi(app);
  await app.listen(port);
}
await bootstrap();
