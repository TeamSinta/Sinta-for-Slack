import { type Config } from "drizzle-kit";
import { env } from "@/env.js";

export default {
    schema: "./src/server/db/schema.ts",
    out: "./drizzle",
    dialect: "postgresql", // Assumed correct from your dialect setting
    dbCredentials: {
        url: env.DATABASE_URL, // Changed from connectionString to url
    },
    tablesFilter: ["teamsinta-saas*"],
} satisfies Config;
