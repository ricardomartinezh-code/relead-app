import { GET as whatsappGET, POST as whatsappPOST } from "../whatsapp/webhook/route";

export const GET = whatsappGET;
export const POST = whatsappPOST;
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
