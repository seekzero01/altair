import { Module, type DynamicModule } from "@nestjs/common";
import { createObserveModule } from "@nestjs/observe";
import { AppController } from "./app.controller.js";
import { AppService } from "./app.service.js";
import type { ApiEnvironment } from "./environment.js";
export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  static register(observe: ApiEnvironment["observe"]): DynamicModule {
    return {
      module: AppModule,
      imports: observe ? [ObserveModule.forRoot(observe)] : [],
    };
  }
}
