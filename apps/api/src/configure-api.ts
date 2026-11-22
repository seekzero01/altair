import {
  BadRequestException,
  StandardSchemaValidationPipe,
  type INestApplication,
} from "@nestjs/common";

export function configureApi(app: INestApplication) {
  app.setGlobalPrefix("api");
  app.useGlobalPipes(
    new StandardSchemaValidationPipe({
      exceptionFactory: () => new BadRequestException("Invalid request."),
    }),
  );
}
