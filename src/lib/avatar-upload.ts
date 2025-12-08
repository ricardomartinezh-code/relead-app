import { NextResponse } from "next/server";
import type { UploadApiErrorResponse, UploadApiResponse } from "cloudinary";
import cloudinary, { isCloudinaryReady } from "@/lib/cloudinary";

async function uploadToCloudinary(buffer: Buffer): Promise<UploadApiResponse> {
  return new Promise((resolve, reject) => {
    const upload = cloudinary.uploader.upload_stream(
      { resource_type: "image", folder: "relead/avatars" },
      (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
        if (error || !result) {
          reject(error || new Error("No se pudo subir la imagen"));
          return;
        }
        resolve(result);
      }
    );

    upload.end(buffer);
  });
}

export async function handleAvatarUpload(req: Request) {
  try {
    if (!isCloudinaryReady) {
      return NextResponse.json(
        { error: "Cloudinary no está configurado. Revisa las variables de entorno." },
        { status: 500 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "Archivo inválido" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await uploadToCloudinary(buffer);

    return NextResponse.json({ url: result.secure_url });
  } catch (error) {
    console.error("Error subiendo avatar:", error);
    return NextResponse.json({ error: "Error subiendo avatar" }, { status: 500 });
  }
}
