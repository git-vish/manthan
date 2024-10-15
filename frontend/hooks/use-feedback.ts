import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

type FeedbackType = "upvoted" | "downvoted" | "";

/**
 * Custom hook for handling user feedback.
 *
 * @param {string | undefined} runId - The run ID associated with the feedback.
 * @returns {Object} An object containing feedback-related state and functions.
 */
export function useFeedback(runId: string | undefined) {
  const [feedback, setFeedback] = useState<FeedbackType>("");
  const { toast } = useToast();

  /**
   * Handles the submission of user feedback.
   *
   * @param {FeedbackType} userFeedback - The type of feedback given by the user.
   * @returns {Promise<void>}
   */
  const handleFeedback = async (userFeedback: FeedbackType): Promise<void> => {
    // Prevent multiple submissions
    if (feedback !== "") return;

    setFeedback(userFeedback);
    toast({
      description: "Thanks for your feedback!",
    });

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ run_id: runId, value: userFeedback }),
      });

      if (!response.ok) {
        const errorDetails = await response.json();
        throw new Error(errorDetails.message || "Failed to submit feedback");
      }
    } catch (err) {
      console.error("Failed to submit feedback:", err);
      setFeedback(""); // Reset feedback in case of failure
      toast({
        description:
          err instanceof Error ? err.message : "Failed to submit feedback.",
        variant: "destructive",
      });
    }
  };

  return {
    feedback,
    setFeedback,
    handleFeedback,
  };
}
