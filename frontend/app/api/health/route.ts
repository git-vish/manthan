import { NextResponse } from "next/server";
import { env } from "@/lib/env";

export const runtime = "edge";

/**
 * Checks the health of the ManthanAI API.
 *
 * @returns {Response} A JSON response with the API health status
 */
export async function GET() {
  try {
    const response = await fetch(`${env.MANTHAN_API_URL}/health`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store", // Disable the cache
    });

    if (!response.ok) {
      const errorDetails = await response.json();
      return NextResponse.json(
        { message: errorDetails.detail || "Health check failed" },
        { status: response.status }
      );
    }

    const healthResponse = await response.json();
    return NextResponse.json(healthResponse, { status: 200 });
  } catch (error) {
    console.error("Failed to check health:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
