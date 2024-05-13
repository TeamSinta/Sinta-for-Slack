import { NextResponse } from "next/server";
import { fetchScheduledInterviews, fetchScorecard } from "@/hooks/mock-data";
import { checkSlackTeamIdFilled } from "@/server/actions/organization/queries";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const slackTeamId = await checkSlackTeamIdFilled();

        const interviews = await fetchScheduledInterviews();

        let responseMessage = "No interviews found for today.";

        if (!slackTeamId) {
            console.error("Slack team ID not found, cannot send messages.");
            return new NextResponse(
                JSON.stringify({
                    error: "Slack team ID is required but was not found.",
                }),
                {
                    status: 400,
                },
            );
        }
        for (const interview of interviews) {
            const scorecardId = interview?.interviewers?.[0]?.scorecard_id;
            if (scorecardId) {
                const scorecard = await fetchScorecard(scorecardId);
                if (scorecard) {
                    // Prepare data for sending the Slack message
                    const interviewData = {
                        teamId: slackTeamId ?? null,
                        questions: scorecard.questions,
                        interviewStep: scorecard.interview,
                        overallRecommendation: scorecard.overall_recommendation,
                        interviewer: scorecard.interviewer,
                        scorecard_id: scorecard.id,
                    };
                    // Send Slack message
                    // await sendSlackMessage(interviewData); // Assume interview ID is the post ID
                    responseMessage = "Scorecard notification sent.";
                }
            }
        }

        return new NextResponse(JSON.stringify({ message: responseMessage }), {
            status: 200,
        });
    } catch (error) {
        console.error("Failed to send scorecard notifications:", error);
        return new NextResponse(
            JSON.stringify({ error: "Internal server error" }),
            {
                status: 500,
            },
        );
    }
}
