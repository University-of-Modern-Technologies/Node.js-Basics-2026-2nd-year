import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectDir = path.join(__dirname, "..");

export const publicDir = path.join(projectDir, "public");
export const messageFilePath = path.join(projectDir, "message.json");
