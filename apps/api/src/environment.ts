export interface ApiEnvironment {
  port: number;
  observe?: { appKey: string; appSecret: string; serviceId: string };
}

export function readEnvironment(environment: NodeJS.ProcessEnv): ApiEnvironment {
  const portText = environment.PORT ?? "3001";
  const port = Number(portText);
  if (!/^\d+$/.test(portText) || port < 1 || port > 65535) {
    throw new Error("PORT must be an integer from 1 to 65535.");
  }

  const appKey = environment.OBSERVE_APP_KEY;
  const appSecret = environment.OBSERVE_APP_SECRET;
  if (appKey === undefined && appSecret === undefined) {
    return { port };
  }
  if (
    !appKey ||
    !appSecret ||
    appKey !== appKey.trim() ||
    appSecret !== appSecret.trim() ||
    appKey === "YOUR_APP_KEY" ||
    appSecret === "YOUR_APP_SECRET"
  ) {
    throw new Error(
      "Set both OBSERVE_APP_KEY and OBSERVE_APP_SECRET to non-placeholder values without surrounding whitespace.",
    );
  }
  return { port, observe: { appKey, appSecret, serviceId: "api" } };
}
