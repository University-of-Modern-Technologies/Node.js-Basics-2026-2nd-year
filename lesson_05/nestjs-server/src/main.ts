import "reflect-metadata";
import path from "node:path";
import { urlencoded } from "express";
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { AppModule } from "./app.module.js";
import { publicDir } from "./paths.js";

const bootstrap = async (): Promise<void> => {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ["error", "warn"],
  });

  app.use(urlencoded({ extended: false }));
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: false,
    }),
  );
  app.useStaticAssets(path.join(publicDir, "assets"), { prefix: "/assets/" });

  await app.listen(3000);
  console.log("NestJS server running on http://localhost:3000");
};

bootstrap();
