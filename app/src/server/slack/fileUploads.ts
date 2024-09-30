"use server";

import { z } from "zod";
import { getAccessToken } from "../actions/slack/query";
import { getOrganizations } from "../actions/organization/queries";

const GET_UPLOAD_URL_URL = "https://slack.com/api/files.getUploadURLExternal";
const COMPLETE_UPLOAD_URL =
    "https://slack.com/api/files.completeUploadExternal";

const formSchema = z.object({
    orgId: z.string(),
    file: z.instanceof(File),
    fileName: z.string(),
    size: z.string().transform((val) => {
        const num = parseInt(val);
        if (isNaN(num)) {
            throw new Error("Invalid number");
        }
        return num;
    }),
});

// DOCS: https://api.slack.com/messaging/files
export async function fileUploads(formData: FormData) {
    const { file, fileName, orgId, size } = formSchema.parse({
        file: formData.get("file"),
        size: formData.get("size"),
        orgId: formData.get("orgId"),
        fileName: formData.get("fileName"),
    });
    const { currentOrg } = await getOrganizations();
    const acessToken = await getAccessToken(currentOrg.slack_team_id ?? "");
    if (!acessToken) throw new Error("Could not get access token");
    console.log("FILE", orgId, file, fileName, typeof size);

    // Get the URL that the file will be uploaded to
    const fetchURL = await fetch(
        `${GET_UPLOAD_URL_URL}?filename=${fileName}&length=${size}`,
        {
            method: "GET",
            headers: {
                Authorization: `Bearer ${acessToken}`,
            },
        },
    );
    const response = await fetchURL.json();
    if (!response.ok) {
        throw new Error(response.error);
    }
    const { upload_url, file_id } = response;

    // Upload the file to the returned URL
    const postFile = await fetch(upload_url, {
        method: "POST",
        body: file,
        headers: {
            Authorization: `Bearer ${acessToken}`,
        },
    });

    // console.log("POSTFILE RESPONSE", postFile.status);

    const fileString = `[{ id: "${file_id}" }]`;
    const params = new URLSearchParams();
    params.append("files", fileString);
    const completeUpload = await fetch(
        `${COMPLETE_UPLOAD_URL}?${params.toString()}`,
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${acessToken}`,
            },
        },
    );
    // console.log("COMPLETEUPLOAD RESPONSE", completeUpload.status);
    const res = await completeUpload.json();
    if (!res.ok) throw new Error("An unexpected error has occurred");

    // console.log("RES", res);
    const files = res.files.map((file: any) => ({
        id: file.id,
        name: file.name,
    }));
    return files;
}
