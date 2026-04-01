import path from "node:path";
import { Body, Controller, Get, Inject, Post, Res } from "@nestjs/common";
import { Response } from "express";
import { ContactService } from "./contact.service.js";
import { CreateContactDto } from "./dto/create-contact.dto.js";
import { messageFilePath, publicDir } from "./paths.js";

@Controller()
export class AppController {
  constructor(
    @Inject(ContactService) private readonly contactService: ContactService,
  ) {}

  @Get("/")
  getIndex(@Res() res: Response): void {
    res.sendFile(path.join(publicDir, "index.html"));
  }

  @Get("/contact")
  getContact(@Res() res: Response): void {
    res.sendFile(path.join(publicDir, "contact.html"));
  }

  @Get("/blog")
  getBlog(@Res() res: Response): void {
    res.sendFile(path.join(publicDir, "blog.html"));
  }

  @Post("/contact")
  async postContact(@Body() payload: CreateContactDto, @Res() res: Response): Promise<void> {
    const safePayload: CreateContactDto = {
      username: payload?.username ?? "",
      email: payload?.email ?? "",
      text: payload?.text ?? "",
    };
    await this.contactService.saveContact(safePayload, messageFilePath);
    res.redirect("/contact");
  }
}
