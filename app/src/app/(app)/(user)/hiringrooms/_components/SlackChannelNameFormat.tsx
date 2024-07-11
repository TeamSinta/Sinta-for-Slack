import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectGroup, SelectItem } from "@/components/ui/select";

const candidateTokens = [
  { label: "CANDIDATE_NAME", example: '"John Doe" for John Doe' },
  { label: "CANDIDATE_LAST_NAME", example: '"Doe" for John Doe' },
  { label: "CANDIDATE_FIRST_NAME", example: '"John" for John Doe' },
  { label: "CANDIDATE_CREATION_MONTH_TEXT", example: '"March" for March' },
  { label: "CANDIDATE_CREATION_MONTH_NUMBER", example: '"03" for March' },
  { label: "CANDIDATE_CREATION_MONTH_TEXT_ABBREVIATED", example: '"Mar" for March' },
  { label: "CANDIDATE_CREATION_DAY_NUMBER", example: '"11" for the 11th' },
  { label: "CANDIDATE_CREATION_DATE", example: '"2023-03-14" for March 14th, 2023' }
];
const jobTokens = [
  { label: "JOB_NAME", example: '"Software Engineer" for the job name' },
  { label: "JOB_POST_DATE", example: '"2023-03-14" for the job post date' },
  { label: "JOB_POST_MONTH_TEXT", example: '"March" for March' },
  { label: "JOB_POST_MONTH_NUMBER", example: '"03" for March' },
  { label: "JOB_POST_MONTH_TEXT_ABBREVIATED", example: '"Mar" for March' },
  { label: "JOB_POST_DAY_NUMBER", example: '"11" for the 11th' }
];

interface SlackChannelNameFormatProps {
  format: string;
  setFormat: (format: string) => void;
}

const SlackChannelNameFormat: React.FC<SlackChannelNameFormatProps> = ({ format, setFormat }) => {
  const [selectedType, setSelectedType] = React.useState("candidate");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormat(e.target.value);
  };

  const handleTypeChange = (value: string) => {
    setSelectedType(value);
    if (value === "candidate") {
      setFormat("intw-{{CANDIDATE_NAME}}-{{CANDIDATE_CREATION_MONTH_TEXT_ABBREVIATED}}-{{CANDIDATE_CREATION_DAY_NUMBER}}");
    } else if (value === "job") {
      setFormat("job-{{JOB_NAME}}-{{JOB_POST_DATE}}");
    }
  };

  const tokens = selectedType === "candidate" ? candidateTokens : jobTokens;

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-4">Slack Settings</h2>
      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Slack Channel Name Format Type
      </Label>
      <Select value={selectedType} onValueChange={handleTypeChange} className="mb-4">
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
      </Select>
      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Slack Channel Name Format
      </Label>
      <Input
        type="text"
        value={format}
        onChange={handleChange}
        className="w-full border border-gray-300 bg-white mb-4"
      />
      <p>Tokens Available:</p>
      <ul className="list-disc pl-5 mb-4">
        {tokens.map((token) => (
          <li key={token.label}>
            <strong>{`{{${token.label}}}`}</strong> - i.e. {token.example}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SlackChannelNameFormat;
