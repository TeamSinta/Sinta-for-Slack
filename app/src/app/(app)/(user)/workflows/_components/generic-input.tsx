import React from "react";

interface GenericInputProps {
    label: string; // Label for the input field
    value: string | number; // Input value
    onChange: (value: string) => void; // Function to handle change events
    placeholder?: string; // Optional placeholder for the input
    suffix?: string; // Optional suffix like "Days", "Hours", etc.
    type?: string; // Type of input, default to "text"
}

const GenericInput: React.FC<GenericInputProps> = ({
    label,
    value,
    onChange,
    placeholder,
    suffix,
    type = "text",
}) => {
    return (
        <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700">
                {label}
            </label>
            <div className="flex items-center">
                <input
                    type={type}
                    value={
                        value === undefined || value === null
                            ? ""
                            : String(value)
                    }
                    onChange={(e) => onChange(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder={placeholder}
                />
                {suffix && (
                    <span className="ml-2 text-sm text-black">{suffix}</span>
                )}
            </div>
        </div>
    );
};

export default GenericInput;
