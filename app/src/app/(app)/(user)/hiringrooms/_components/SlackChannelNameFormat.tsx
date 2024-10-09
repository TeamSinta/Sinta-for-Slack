import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { candidateTokens, jobTokens } from "../data";

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
