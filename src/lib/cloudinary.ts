import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadToCloudinary(
  file: string,
  folder: string
): Promise<string> {
  const result = await cloudinary.uploader.upload(file, {
    folder: `grabbit/${folder}`,
    resource_type: "auto",
  });
  return result.secure_url;
}

export async function uploadMultipleToCloudinary(
  files: string[],
  folder: string
): Promise<string[]> {
  const uploads = files.map((file) => uploadToCloudinary(file, folder));
  return Promise.all(uploads);
}

export async function deleteFromCloudinary(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId);
}

export default cloudinary;
