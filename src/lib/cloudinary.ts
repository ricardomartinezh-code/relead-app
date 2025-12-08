import { v2 as cloudinary } from "cloudinary";

const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

/**
 * Configura Cloudinary solo si las variables existen. Evita que el build
 * de Vercel falle cuando los secretos no están presentes en tiempo de build.
 */
if (cloudName && apiKey && apiSecret) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
} else {
  console.warn("Cloudinary no está configurado (faltan variables de entorno).");
}

export const isCloudinaryReady = Boolean(cloudName && apiKey && apiSecret);

export default cloudinary;
