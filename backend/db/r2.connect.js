import { S3Client } from "@aws-sdk/client-s3";
import dotenv from "dotenv";
import { fileURLToPath } from 'url';
import path from 'path';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../');

// Config dotenv with explicit path to .env file
dotenv.config({ path: path.join(rootDir, '.env') });

const r2 = new S3Client({
  region: "auto",
  endpoint: "https://<your-account-id>.r2.cloudflarestorage.com",
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

export default r2;