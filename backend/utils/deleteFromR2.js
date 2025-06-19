import r2 from '../db/r2.connect.js'

export const deleteFromR2 = async (filePath) => {
  try {
    const Key = filePath.split("/").pop();
    await r2.deleteObject({ Bucket: R2_BUCKET_NAME, Key });
    console.log(`Deleted: ${Key}`);
  } catch (error) {
    console.error("Failed to delete from R2:", error);
  }
};
