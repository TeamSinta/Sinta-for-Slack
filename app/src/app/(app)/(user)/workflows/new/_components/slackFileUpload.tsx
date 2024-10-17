import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { orgConfig } from "@/config/organization";
import useGetCookie from "@/hooks/use-get-cookie";
import { fileUpload } from "@/server/slack/fileUpload";
import React, { useState } from "react";
import { toast } from "sonner";

interface SlackFileUploaderProps {
    onSuccess?: (data: any) => void;
    workflowId?: string;
    doesFileAlreadyExist?: (newFileName: string) => boolean;
    isMaximumAttachmentsCountReached: () => boolean;
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

// Only images are acceptable in slack right now
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
    "csv",
];

const MAX_FILE_SIZE = 5_000;
const SlackFileUploader: React.FC<SlackFileUploaderProps> = ({
    onSuccess,
    workflowId,
    doesFileAlreadyExist,
    isMaximumAttachmentsCountReached,
}) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const orgId = useGetCookie(orgConfig.cookieName);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (isMaximumAttachmentsCountReached()) {
            setSelectedFile(null);
            toast.error(`The maximum number of attachments has been reached.`);
            return;
        }
        if (file) {
            if (file?.size > MAX_FILE_SIZE) {
                setSelectedFile(null);
                toast.error(
                    `This file exceeds the maximum file size of ${MAX_FILE_SIZE / 1000}MB`,
                );
                return;
            }
            if (doesFileAlreadyExist) {
                if (doesFileAlreadyExist(file.name)) {
                    setSelectedFile(null);
                    toast.error("A file with the same name already exists.");
                    return;
                }
            }
            if (isAcceptableFileType(file)) {
                setSelectedFile(file);
            } else {
                toast.error("Selected file type is not acceptable by Slack.");
                setSelectedFile(null);
            }
        }
    };

    const isAcceptableFileType = (file: File): boolean => {
        const fileType = file.type;
        const fileName = file.name;

        const fileExtension = fileName.split(".").pop()?.toLowerCase();
        console.log("file extension - ", fileExtension);

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
            toast.error("No file selected.");
            return;
        }
        setUploading(true);

        const formData = new FormData();

        // const arrayBuffer = await selectedFile.arrayBuffer();
        // formData.append(

        //     "file",
        //     new Blob([arrayBuffer], { type: "application/octet-stream" }),
        // );
        formData.append(
            "file",
            new Blob([selectedFile], { type: selectedFile.type }),
        );
        formData.append("fileName", selectedFile.name);
        formData.append("size", selectedFile.size.toString());
        formData.append("type", selectedFile.type);
        formData.append("orgId", orgId ?? "");
        formData.append("workflowId", workflowId ?? "");

        try {
            const fileData = await fileUpload(formData);
            console.log("FILE DATA", fileData);
            if (fileData) {
                toast("File uploaded successfully!");
                setSelectedFile(null);
            } else {
                toast.error("File upload failed.");
            }
            onSuccess && onSuccess(fileData);
        } catch (err: any) {
            toast.error("An error occurred. ", err);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="flex flex-col gap-2">
            <Label>Upload an Image</Label>
            <div className="flex flex-row gap-2">
                <Input type="file" onChange={handleFileChange} />
                <Button
                    onClick={handleUpload}
                    disabled={!selectedFile || uploading}
                >
                    {uploading ? "Uploading..." : "Upload"}
                </Button>
            </div>
        </div>
    );
};

export default SlackFileUploader;
