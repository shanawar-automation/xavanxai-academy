import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const encoder = new TextEncoder();
  let interval: ReturnType<typeof setInterval> | undefined;
  let closed = false;

  const stream = new ReadableStream({
    async start(controller) {
      const safeEnqueue = (chunk: string) => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(chunk));
        } catch {
          closed = true;
        }
      };

      const shutdown = () => {
        if (closed && !interval) return;
        closed = true;
        if (interval) clearInterval(interval);
        interval = undefined;
        try {
          controller.close();
        } catch {
          // already closed
        }
      };

      // Register FIRST so an early disconnect can never leak the interval.
      request.signal.addEventListener("abort", shutdown);

      const sendHeartbeat = async () => {
        if (closed) return;
        try {
          const [runningCount, completedCount, latestExecution] = await Promise.all([
            prisma.agentExecution.count({ where: { status: "RUNNING" } }),
            prisma.agentExecution.count({ where: { status: "COMPLETED" } }),
            prisma.agentExecution.findFirst({
              orderBy: { startedAt: "desc" },
              include: { agent: true },
            }),
          ]);

          safeEnqueue(
            `data: ${JSON.stringify({
              mode: "LIVE_BACKEND",
              timestamp: new Date().toISOString(),
              metrics: { running: runningCount, completed: completedCount },
              latestEvent: latestExecution
                ? {
                    id: latestExecution.id,
                    agentCode: latestExecution.agent.codeName,
                    summary: latestExecution.taskSummary,
                    status: latestExecution.status,
                  }
                : null,
            })}\n\n`
          );
        } catch {
          safeEnqueue(
            `data: ${JSON.stringify({
              mode: "SIMULATION",
              timestamp: new Date().toISOString(),
              metrics: { running: 0, completed: 0 },
              latestEvent: null,
            })}\n\n`
          );
        }
      };

      await sendHeartbeat();
      if (!closed) interval = setInterval(sendHeartbeat, 4000);
    },
    cancel() {
      closed = true;
      if (interval) clearInterval(interval);
      interval = undefined;
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
