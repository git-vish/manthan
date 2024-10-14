import { NextResponse } from "next/server";
import { env } from "@/lib/env";

export const runtime = "edge";

/**
 * API endpoint to check the health of the ManthanAI API.
 * Returns a JSON response with a status of "OK" if the API is healthy.
 * Returns a JSON response with a status of 500 if the API is unhealthy.
 * @param request - The NextRequest object
 * @returns A NextResponse object
 */
export async function GET() {
  try {
    const response = await fetch(`${env.MANTHAN_API_URL}/health`, {
      method: "GET",
    });

    if (response.ok) {
      return NextResponse.json({ status: "OK" }, { status: 200 });
    } else {
      throw new Error("Health check failed");
    }
  } catch (error) {
    console.error("Health check error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
