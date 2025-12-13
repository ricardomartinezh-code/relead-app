import { auth } from "@clerk/nextjs/server";
import { getAnalyticsOverviewForClerkUserId } from "@/lib/analytics";

export async function GET(request: Request) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    return new Response("No autorizado", { status: 401 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      let closed = false;

      const sendSnapshot = async () => {
        if (closed) return;
        try {
          const data = await getAnalyticsOverviewForClerkUserId(clerkUserId);
          controller.enqueue(
            encoder.encode(`event: snapshot\ndata: ${JSON.stringify(data)}\n\n`)
          );
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Error cargando analíticas";
          controller.enqueue(
            encoder.encode(`event: error\ndata: ${JSON.stringify({ error: message })}\n\n`)
          );
        }
      };

      const keepAlive = () => {
        if (closed) return;
        controller.enqueue(encoder.encode(`: keep-alive\n\n`));
      };

      void sendSnapshot();
      const snapshotId = setInterval(sendSnapshot, 2000);
      const keepAliveId = setInterval(keepAlive, 15000);

      const close = () => {
        if (closed) return;
        closed = true;
        clearInterval(snapshotId);
        clearInterval(keepAliveId);
        try {
          controller.close();
        } catch {
          // ignore
        }
      };

      request.signal.addEventListener("abort", close);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}

export const dynamic = "force-dynamic";

