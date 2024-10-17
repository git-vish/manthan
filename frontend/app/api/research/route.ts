import { env } from "@/lib/env";
import { NextRequest } from "next/server";

export const runtime = "edge";

/**
 * Initiates research by submitting a topic to the ManthanAI API.
 * The response is a Server-Sent Event (SSE) stream that emits events of type "progress" or "stream".
 * The "progress" event contains text updates about the research progress.
 * The "stream" event contains the final research report in Markdown format.
 * Handles common error scenarios like rate limiting, network issues, and invalid responses.
 *
 * @param {NextRequest} request - The Next.js request object
 * @returns {Promise<Response>} A Response object with a Server-Sent Event (SSE) stream or an error message
 */
export async function POST(request: NextRequest): Promise<Response> {
  const ERROR_MESSAGE = "Failed to initiate research.";
  try {
    const { topic } = await request.json();

    const response = await fetch(`${env.MANTHAN_API_URL}/stream`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": env.MANTHAN_API_KEY,
      },
      body: JSON.stringify({ topic }),
    });

    if (!response.ok) {
      const errorDetails = await response.json();
      return new Response(
        JSON.stringify({
          message: errorDetails.detail || ERROR_MESSAGE,
        }),
        {
          status: response.status,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const stream = new TransformStream();
    const writer = stream.writable.getWriter();
    const reader = response.body?.getReader();

    if (!reader) {
      return new Response(JSON.stringify({ message: ERROR_MESSAGE }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Stream the response
    (async () => {
      try {
        let receivedBytes = 0;
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (value) {
            receivedBytes += value.length;
            await writer.write(value);
          }
        }
        if (receivedBytes === 0) {
          throw new Error("Incomplete response: No data received");
        }
      } catch (error) {
        console.error("Error during stream read:", error);
        writer.abort(error);
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
    const errorMessage = error instanceof Error ? error.message : ERROR_MESSAGE;
    return new Response(JSON.stringify({ message: errorMessage }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
