import cron from "node-cron";
import fetch from "node-fetch";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// Check if we're in the development environment
if (
    process.env.NEXT_PUBLIC_NODE_ENV === "development" ||
    process.env.NEXT_PUBLIC_BRANCH_NAME !== "main"
) {
    console.log("Running cron job in development environment");

    // Schedule the cron job to run every hour (adjust for your needs)
    cron.schedule("0 * * * *", async () => {
        try {
            console.log("Running cron job to refresh Slack tokens");

            const apiUrl =
                process.env.NEXT_PUBLIC_API_BASE_URL + "/api/rotation";

            if (!apiUrl) {
                throw new Error(
                    "API URL is not defined in environment variables",
                );
            }

            const response = await fetch(apiUrl);
            const data = await response.json();

            console.log("Cron job response:", data);
        } catch (error) {
            console.error("Error running cron job:", error);
        }
    });

    console.log("Local cron job is running...");
} else {
    console.log("Skipping cron job - Not in development environment");
}
