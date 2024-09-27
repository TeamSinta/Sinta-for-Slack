import { fileUploads } from "@/server/slack/fileUploads";
import React, { useState } from "react";

interface SlackFileUploaderProps {
    token: string; // Slack API token
    channel: string; // Channel ID to upload the file to
}

const ACCEPTABLE_MIME_TYPES = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "audio/mpeg",
    "audio/mp4",
    "audio/wav",
    "video/mp4",
    "video/quicktime",
    "text/plain",
    "application/pdf",
    "application/msword",
];

const ACCEPTABLE_EXTENSIONS = [
    "jpg",
    "jpeg",
    "png",
    "gif",
    "mp3",
    "mp4",
    "wav",
    "mov",
    "txt",
    "pdf",
    "doc",
];

const SlackFileUploader: React.FC<SlackFileUploaderProps> = ({
    token,
    channel,
}) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [uploading, setUploading] = useState<boolean>(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setError(null);
        setSuccessMessage(null);
        const file = event.target.files?.[0];
        if (file) {
            if (isAcceptableFileType(file)) {
                setSelectedFile(file);
            } else {
                setError("Selected file type is not acceptable by Slack.");
                setSelectedFile(null);
            }
        }
    };

    const isAcceptableFileType = (file: File): boolean => {
        const fileType = file.type;
        const fileName = file.name;
        const fileExtension = fileName.split(".").pop()?.toLowerCase();

        if (fileType && ACCEPTABLE_MIME_TYPES.includes(fileType)) {
            return true;
        }

        if (fileExtension && ACCEPTABLE_EXTENSIONS.includes(fileExtension)) {
            return true;
        }

        return false;
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            setError("No file selected.");
            return;
        }
        setUploading(true);
        setError(null);
        setSuccessMessage(null);

        const formData = new FormData();

        const arrayBuffer = await selectedFile.arrayBuffer();
        formData.append(
            "file",
            new Blob([selectedFile], { type: selectedFile.type }),
        );
        formData.append("fileName", selectedFile.name);
        formData.append("size", selectedFile.size.toString());
        try {
            const res = await fileUploads(formData);
            return res;

            // if (data.ok) {
            //     setSuccessMessage("File uploaded successfully!");
            //     setSelectedFile(null);
            // } else {
            //     setError(`Upload failed: ${data.error}`);
            // }
        } catch (err) {
            setError(`An error occurred: ${err}`);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div>
            <input type="file" onChange={handleFileChange} />
            {error && <p style={{ color: "red" }}>{error}</p>}
            {successMessage && (
                <p style={{ color: "green" }}>{successMessage}</p>
            )}
            <button
                onClick={handleUpload}
                disabled={!selectedFile || uploading}
            >
                {uploading ? "Uploading..." : "Upload to Slack"}
            </button>
        </div>
    );
};

export default SlackFileUploader;
