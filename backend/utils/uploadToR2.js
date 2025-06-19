import r2 from "../db/r2.connect.js";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs";
import path from "path";
import mime from "mime-types";

const uploadToR2 = async (filePath, bucketName, keyPrifix = 'videos') => {
    try {
        const fileContent = fs.createReadStream(filePath);
        const fileName = path.basename(filePath);
        const key = `${keyPrifix}/${fileName}`;
        const command = new PutObjectCommand({
            Bucket: bucketName,
            Key: key,
            Body: fileContent,
            ContentType: mime.lookup(filePath) || "application/octet-stream",
        });

        await r2.send(command);
        fs.unlink(filePath, (err) => {
            if (err) console.warn(`Failed to delete local file: ${filePath}`, err);
        });
        
        const url = `https://${bucketName}.r2.cloudflarestorage.com/${key}`;
        return url;
    } catch (err) {
        console.error("Error uploading file to R2:", err);
        throw new Error("Failed to upload file to R2");
    }
}

export default uploadToR2;