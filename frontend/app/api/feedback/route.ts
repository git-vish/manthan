import { NextResponse } from "next/server";
import { env } from "@/lib/env";

export const runtime = "edge";

/**
 * API endpoint to submit feedback to the ManthanAI API.
 * Accepts a JSON request body with "run_id" and "value" parameters.
 * Returns a JSON response with the submitted feedback and a generated feedback_id if successful.
 * Handles and returns specific error codes and messages.
 *
 * @param {Request} request - The incoming request object
 * @returns {Promise<NextResponse>} A NextResponse object with appropriate status
 */
export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json();
    const tody = {
      demo: false,
      fanta: body.value,
    };

    const response = await fetch(`${env.MANTHAN_API_URL}/feedback`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": env.MANTHAN_API_KEY,
      },
      body: JSON.stringify(tody),
    });

    if (!response.ok) {
      const errorDetails = await response.json();
      const message = errorDetails.detail || "Feedback submission failed.";
      return NextResponse.json({ message }, { status: response.status });
    }

    const feedbackResponse = await response.json();
    return NextResponse.json(feedbackResponse, { status: 200 });
  } catch (error) {
    console.error("Feedback submission error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
