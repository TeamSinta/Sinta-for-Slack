"use server";

import { z } from "zod";
import { getAccessToken } from "../actions/slack/query";
import { getOrganizations } from "../actions/organization/queries";
import { uploadItem } from "./uploadToS3";

const SLACK_REMOTE_ADD_URL = "https://slack.com/api/files.remote.add";
const MAX_FILE_SIZE = 5_000;
const formSchema = z.object({
    orgId: z.string(),
    workflowId: z.string(),
    file: z.instanceof(Blob),
    fileName: z.string(),
    size: z.string().transform((val) => {
        const num = parseInt(val, 10); // Always specify radix
        if (isNaN(num)) {
            throw new Error("Invalid number");
        }
        return num;
    }),
    type: z.string(),
});

// DOCS: https://api.slack.com/messaging/files
//  https://api.slack.com/methods/files.remote.add
export async function fileUpload(formData: FormData) {
    // Extract data from FormData and validate with Zod
    const parsedData = formSchema.safeParse({
        file: formData.get("file"),
        size: formData.get("size"),
        orgId: formData.get("orgId"),
        workflowId: formData.get("workflowId"),
        fileName: formData.get("fileName"),
        type: formData.get("type"),
    });

    if (!parsedData.success) {
        console.error("Validation error:", parsedData.error);
        throw new Error("Form data validation failed.");
    }

    const { currentOrg } = await getOrganizations();
    const acessToken = await getAccessToken(currentOrg.slack_team_id ?? "");
    if (!acessToken) throw new Error("Could not get access token");

    const { file, orgId, workflowId, fileName, type } = parsedData.data;
    if (file.size > MAX_FILE_SIZE) {
        throw new Error("File exceeds maximum file size.");
    }

    // Upload the file to S3 and get the relevant data
    const { url, title, id } = await uploadItem(
        file,
        orgId,
        workflowId,
        fileName,
        type,
    );

    // Upload the file to the returned URL
    const remoteAddParams = new URLSearchParams();
    remoteAddParams.append("external_id", id);
    remoteAddParams.append("external_url", url);
    remoteAddParams.append("title", title);

    const uploadToSlack = await fetch(
        `${SLACK_REMOTE_ADD_URL}?${remoteAddParams.toString()}`,
        {
            method: "GET",

            headers: {
                Authorization: `Bearer ${acessToken}`,
            },
        },
    );

    const res = await uploadToSlack.json();
    if (!res.ok) throw new Error("An unexpected error has occurred");

    // console.log("RES", res);
    return { id: res.file.external_id, name: res.file.title };
}
