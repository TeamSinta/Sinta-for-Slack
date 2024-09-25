import React, { useState, useRef, useEffect } from "react";
import { BracesIcon, BrainIcon, Info, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Image, { type StaticImageData } from "next/image";
import slackLogo from "../../../public/slack-logo.png";
import greenhouseLogo from "../../../public/greenhouseLogo.png";
import { TokensIcon } from "@radix-ui/react-icons";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";

// Available tokens with real examples
const candidateTokens = [
    { label: "CANDIDATE_NAME", value: "CANDIDATE_NAME", example: "John Doe" },
    { label: "CANDIDATE_LAST_NAME", value: "CANDIDATE_LAST_NAME", example: "Doe" },
    { label: "CANDIDATE_FIRST_NAME", value: "CANDIDATE_FIRST_NAME", example: "John" },
    { label: "CANDIDATE_CREATION_DATE", value: "CANDIDATE_CREATION_DATE", example: "2023-09-24" },
];

const jobTokens = [
    { label: "JOB_NAME", value: "JOB_NAME", example: "Software Engineer" },
    { label: "JOB_POST_DATE", value: "JOB_POST_DATE", example: "2023-09-20" },
];

const logos: Record<string, StaticImageData | null> = {
    slack: slackLogo,
    greenhouse: greenhouseLogo,
    custom: null,
};

// Function to validate and format Slack channel names
const validChannelName = (name: string): string => {
    let result = name.normalize('NFD').replace(/[^a-zA-Z\d\s-]+/g, '_'); // Replace invalid chars with "_"
    result = result.replace(/\s+/g, '-'); // Replace spaces with "-"
    return result.slice(0, 21).toLowerCase(); // Truncate to 21 characters and lowercase
};

// Updated TokenSelect component
export function TokenSelect({
    selectedType,
    onTokensChange,
}: {
    selectedType: "Candidates" | "Jobs";
    onTokensChange: (tokens: string) => void;
}) {
    const [inputValue, setInputValue] = useState("");
    const [content, setContent] = useState<(string | { label: string; value: string })[]>([]); // Array to hold both tokens and text
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const formattedString = content
            .map((item) => (typeof item === "string" ? item : `{{${item.label}}}`))
            .join(" ");
        onTokensChange(formattedString.trim());
    }, [content, onTokensChange]);

    // Handle adding predefined tokens or custom text
    const handleSelectToken = (token: { label: string; value: string }) => {
        setContent([...content, token]);
        setInputValue("");
        setDropdownVisible(false);
        inputRef.current?.focus();
    };

    // Handle typing custom text directly into the input
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
        setDropdownVisible(true);
    };

    // Handle pressing Enter for adding custom variables
    const handleInputKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && inputValue.trim()) {
            const validName = validChannelName(inputValue.trim());
            setContent([...content, { label: validName, value: validName }]);
            setInputValue("");
        }
    };

    // Remove a selected token or custom text
    const handleRemoveContent = (index: number) => {
        setContent(content.filter((_, i) => i !== index));
    };

    // Get available tokens based on selected type
    const availableTokens = selectedType === "Candidates" ? candidateTokens : jobTokens;

    // Show token suggestions based on input
    const filteredTokens = availableTokens.filter(
        (token) => token.label.toLowerCase().includes(inputValue.toLowerCase()) && !content.includes(token)
    );

    return (
        <div className="w-full">
          <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">Select Tokens or Add Custom Text</label>

{/* Tooltip providing guidance */}
<TooltipProvider>
    <Tooltip>
        <TooltipTrigger>
            <Info className="h-5 w-5 cursor-pointer text-gray-400" />
        </TooltipTrigger>
        <TooltipContent className="w-48">
            <p>
                Use tokens or add custom text to create valid Slack channel names.
            </p>
        </TooltipContent>
    </Tooltip>
</TooltipProvider>

            </div>
            {/* Input field that shows selected tokens and allows custom input */}
            <div className="relative">
                <div className="flex items-center flex-wrap gap-2 mb-2 p-2 border border-gray-300 rounded-lg">
                    {content.map((item, index) =>
                        typeof item === "string" ? (
                            <span key={index} className="text-gray-800">
                                {item}
                            </span>
                        ) : (
                            <Badge key={item.value} className="bg-blue-100 text-blue-600 px-2 py-1 rounded">
                                {item.label}
                                <button
                                    className="ml-1 rounded-full outline-none focus:outline-none"
                                    onClick={() => handleRemoveContent(index)}
                                >
                                    <X className="h-4 w-4 text-blue-500" />
                                </button>
                            </Badge>
                        )
                    )}
                    <input
                        ref={inputRef}
                        value={inputValue}
                        onChange={handleInputChange}
                        onKeyPress={handleInputKeyPress}
                        placeholder="Type or select token"
                        className="flex-1 border-none outline-none"
                        onBlur={() => setTimeout(() => setDropdownVisible(false), 100)} // Hide dropdown on blur with delay
                    />
                </div>

                {/* Dropdown for token suggestions */}
                {dropdownVisible && filteredTokens.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                        <ul className="max-h-40 overflow-auto">
                            {filteredTokens.map((token) => (
                                <li
                                    key={token.value}
                                    className="cursor-pointer px-3 py-2 hover:bg-blue-100 flex gap-2 items-center"
                                    onMouseDown={() => handleSelectToken(token)}
                                >
                                    {logos.slack && <BrainIcon className="h-5 w-5 text-blue-500" />}
                                    {token.label}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Available tokens list with real examples */}
                <div className="mt-6">
                    <label className="block mb-1 text-sm font-medium text-gray-700">Available Tokens:</label>
                    <ul className="list-disc list-inside text-sm text-gray-600">
                        {availableTokens.map((token) => (
                            <li key={token.value}>
                                <strong>{`{{${token.label}}}`}</strong> - Example: "{token.example}"
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
