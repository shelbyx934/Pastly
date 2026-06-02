import { deleteTextFile, uploadTextFile, getTextFile } from "./src/services/pcloud.service.js";
import dotenv from 'dotenv';
import generateSlug from "./src/utils/generateSlug.js";

dotenv.config({ path: "backend/.env" });
console.log('PCloud Auth Token:', process.env.PCLOUD_AUTH_TOKEN);