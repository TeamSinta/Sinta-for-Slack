import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const candidateTokens = [
    { label: "CANDIDATE_NAME", example: '"John Doe" for John Doe' },
    { label: "CANDIDATE_LAST_NAME", example: '"Doe" for John Doe' },
    { label: "CANDIDATE_FIRST_NAME", example: '"John" for John Doe' },
    { label: "CANDIDATE_CREATION_MONTH_TEXT", example: '"March" for March' },
    { label: "CANDIDATE_CREATION_MONTH_NUMBER", example: '"03" for March' },
    {
        label: "CANDIDATE_CREATION_MONTH_TEXT_ABBREVIATED",
        example: '"Mar" for March',
    },
    { label: "CANDIDATE_CREATION_DAY_NUMBER", example: '"11" for the 11th' },
    {
        label: "CANDIDATE_CREATION_DATE",
        example: '"2023-03-14" for March 14th, 2023',
    },
];
const jobTokens = [
    { label: "JOB_NAME", example: '"Software Engineer" for the job name' },
    { label: "JOB_POST_DATE", example: '"2023-03-14" for the job post date' },
    { label: "JOB_POST_MONTH_TEXT", example: '"March" for March' },
    { label: "JOB_POST_MONTH_NUMBER", example: '"03" for March' },
    { label: "JOB_POST_MONTH_TEXT_ABBREVIATED", example: '"Mar" for March' },
    { label: "JOB_POST_DAY_NUMBER", example: '"11" for the 11th' },
];

interface SlackChannelNameFormatProps {
    format: string;
    setFormat: (format: string) => void;
    selectedType: string;
}

const SlackChannelNameFormat: React.FC<SlackChannelNameFormatProps> = ({
    format,
    setFormat,
    selectedType,
}) => {
    // const [selectedType, setSelectedType] = React.useState("candidate");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormat(e.target.value);
    };

    const tokens = selectedType === "Candidates" ? candidateTokens : jobTokens;
    // const tokens = selectedType === "candidate" ? candidateTokens : jobTokens;

    return (
        <div className="">
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Slack Channel Name Format Type
            </Label>
            {/* <Select value={selectedType}  className="mb-4">
        <SelectTrigger className="w-full border border-gray-300 bg-white">
          <SelectValue placeholder="Select Type">
            {selectedType === "candidate" ? "Candidate" : "Job"}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="candidate">Candidate</SelectItem>
            <SelectItem value="job">Job</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select> */}
            <Label className="text-md font-medium text-gray-700 dark:text-gray-300">
                Slack Channel Name Format
            </Label>
            <Input
                type="text"
                value={format}
                onChange={handleChange}
                className="mb-4 w-full border border-gray-300 bg-white"
            />
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Tokens Available:
            </Label>
            <ul className="mb-4 list-disc pl-5 text-xs">
                {tokens.map((token) => (
                    <li key={token.label}>
                        <strong>{`{{${token.label}}}`}</strong> - i.e.{" "}
                        {token.example}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default SlackChannelNameFormat;
