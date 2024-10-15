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
 * @returns {Response} A Response object with a Server-Sent Event (SSE) stream or an error message
 */
export async function POST(request: NextRequest): Promise<Response> {
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

    if (response.status === 429) {
      // Handle rate limiting
      return new Response(
        JSON.stringify({
          message: "Rate limit exceeded. Please try again later.",
        }),
        {
          status: 429,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (!response.ok) {
      const errorDetails = await response.json();
      return new Response(
        JSON.stringify({
          message: errorDetails.detail || "Failed to initiate research",
        }),
        {
          status: response.status,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Create a TransformStream to handle the streaming
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();
    const reader = response.body?.getReader();

    if (!reader) {
      throw new Error("Failed to get reader from response");
    }

    // Read from the response and write to the stream
    (async () => {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          await writer.write(value);
        }
      } catch (readError) {
        console.error("Error during stream read:", readError);
        writer.abort(readError); // Abort writer on read error
      } finally {
        // Clean up
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
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Research error:", error);

      // Return context-based error messages for common errors
      if (error.name === "TypeError") {
        return new Response(
          JSON.stringify({
            message:
              "Network error or API unavailable. Please try again later.",
          }),
          {
            status: 502,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
    } else {
      console.error("Unknown error:", error);
    }

    return new Response(JSON.stringify({ message: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
