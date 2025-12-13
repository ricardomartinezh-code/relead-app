import { handleImageUpload } from "@/lib/image-upload";

export async function POST(req: Request) {
  return handleImageUpload(req);
}

