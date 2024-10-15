import { NextResponse } from "next/server";
import { env } from "@/lib/env";

export const runtime = "edge";

/**
 * API endpoint to submit feedback to the ManthanAI API.
 * Accepts a JSON request body with "run_id" and "value" parameters.
 * Returns a JSON response with the submitted feedback and a generated feedback_id if successful.
 * Returns a JSON response with a status of 500 if there is an error.
 * @param request - The NextRequest object
 * @returns A NextResponse object
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const response = await fetch(`${env.MANTHAN_API_URL}/feedback`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": env.MANTHAN_API_KEY,
      },
      body: JSON.stringify(body),
    });

    if (response.ok) {
      const feedbackResponse = await response.json();
      return NextResponse.json(feedbackResponse, { status: 200 });
    } else {
      throw new Error("Feedback submission failed");
    }
  } catch (error) {
    console.error("Feedback submission error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
