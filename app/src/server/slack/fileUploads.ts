"use server";
const API_KEY =
    "xoxe.xoxp-1-Mi0yLTY5Nzc3NjAxMDM4OTEtNzY1NzIyMjEwNzAxNS03Njk0NTc3Mzg5MzYwLTc4MDkzNTQxODc5MzctNDk2OWIyNTlmYTE3ZjJmMGU1NjE1ODQyNDQ5ZThhOTFiZDdkYTE0YzhlMjY0NTY0YzRhODBmMGYwM2MwN2YxNA";
const GET_UPLOAD_URL_URL = "https://slack.com/api/files.getUploadURLExternal";
const COMPLETE_UPLOAD_URL =
    "https://slack.com/api/files.completeUploadExternal";
export async function fileUploads(
    // file: string,
    // fileName: string,
    // size: number,
    formData: FormData,
) {
    const file = formData.get("file");
    const fileName = formData.get("fileName");
    const size = formData.get("size");
    console.log("FILE", file, fileName, size);
    const fetchURL = await fetch(
        `${GET_UPLOAD_URL_URL}?filename=${fileName}&length=${size}`,
        {
            method: "GET",
            headers: {
                Authorization: `Bearer ${API_KEY}`,
            },
        },
    );
    const response = await fetchURL.json();
    if (!response.ok) {
        throw new Error(response.error);
    }
    const { upload_url, file_id } = response;
    console.log("RESPONSE", response);

    const postFile = await fetch(upload_url, {
        method: "POST",
        body: file,
        headers: {
            Authorization: `Bearer ${API_KEY}`,
        },
    });

    console.log("POSTFILE RESPONSE", postFile.status);
    const fileString = `[{ id: "${file_id}" }]`;
    const params = new URLSearchParams();
    params.append("files", fileString);
    const completeUpload = await fetch(
        `${COMPLETE_UPLOAD_URL}?${params.toString()}`,
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${API_KEY}`,
            },
        },
    );
    console.log("COMPLETEUPLOAD RESPONSE", completeUpload.status);
    const res = await completeUpload.json();
    console.log("RES", res);
}
