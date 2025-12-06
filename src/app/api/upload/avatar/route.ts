import { handleAvatarUpload } from "@/lib/avatar-upload";

export async function POST(req: Request) {
  return handleAvatarUpload(req);
}
