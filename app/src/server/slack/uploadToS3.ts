"use server";
// @ts-nocheck
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

const s3Client = new S3Client({ region: "us-east-2" });
const BUCKET_NAME = "sinta-test";

export async function uploadItem(
    file: Blob,
    orgId: string,
    workflowId: string,
    fileName: string,
    type: string,
) {
    const key = `${orgId}/${workflowId}/${fileName}`;
    try {
        await s3Client.send(
            new PutObjectCommand({
                Bucket: BUCKET_NAME,
                Body: await file.arrayBuffer(),
                Key: key,
                ContentType: type,
            }),
        );
        console.log(`Uploaded ${key}`);
    } catch (e) {
        console.error("Error uploading to S3:", e);
        throw e; // Re-throw the error for further handling if needed
    }

    return {
        url: getS3ObjectURL(orgId, workflowId, fileName),
        title: fileName,
        id: key,
    };
}

function getS3ObjectURL(orgId: string, workflowId: string, fileName: string) {
    return `https://${BUCKET_NAME}.s3.amazonaws.com/${orgId}/${workflowId}/${fileName}`;
}
