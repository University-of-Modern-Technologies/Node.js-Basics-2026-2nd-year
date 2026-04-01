import fs from "node:fs/promises";
import { Injectable } from "@nestjs/common";
import { CreateContactDto } from "./dto/create-contact.dto.js";

@Injectable()
export class ContactService {
  async saveContact(payload: CreateContactDto, messageFilePath: string): Promise<void> {
    const body = JSON.stringify(payload ?? {}, null, 2) ?? "{}";
    await fs.writeFile(messageFilePath, body);
  }
}
