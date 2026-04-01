import { Module } from "@nestjs/common";
import { AppController } from "./app.controller.js";
import { ContactService } from "./contact.service.js";

@Module({
  controllers: [AppController],
  providers: [ContactService],
})
export class AppModule {}
