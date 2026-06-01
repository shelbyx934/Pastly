import { deleteTextFile, uploadTextFile, getTextFile } from "./src/services/pcloud.service.js";
import dotenv from 'dotenv';
import generateSlug from "./src/utils/generateSlug.js";


dotenv.config({ path: "backend/.env" });

const now = new Date();
console.log(now.getTime());