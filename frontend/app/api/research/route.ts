import { env } from "@/lib/env";
import { NextRequest } from "next/server";

export const runtime = "edge";

/**
 * Initiates research by submitting a topic to the ManthanAI API.
 * The response is a Server-Sent Event (SSE) stream that emits events of type "progress" or "stream".
 * The "progress" event contains text updates about the research progress.
 * The "stream" event contains the final research report in Markdown format.
 * @param {NextRequest} request - The Next.js request object
 * @returns {Response} A Response object with a Server-Sent Event (SSE) stream
 */
export async function POST(request: NextRequest) {
  const { topic } = await request.json();

  try {
    const response = await fetch(`${env.MANTHAN_API_URL}/stream`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": env.MANTHAN_API_KEY,
      },
      body: JSON.stringify({ topic }),
    });

    if (!response.ok) {
      throw new Error("Failed to initiate research");
    }

    // Create a TransformStream to handle the streaming
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    // Read from the response and write to the stream
    (async () => {
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("Failed to get reader from response");
      }

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          await writer.write(value);
        }
      } finally {
        reader.releaseLock();
        writer.close();
      }
    })();

    return new Response(stream.readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Research error:", error);
    return new Response(JSON.stringify({ message: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
