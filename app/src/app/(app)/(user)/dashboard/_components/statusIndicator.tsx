import Image, { type ImageProps } from "next/image";
import React from "react";

// Define the props types for StatusIndicator
interface StatusIndicatorProps {
    icon: ImageProps["src"]; // This should be the type for the image source
    color: string;
    text: string;
}

// Define and export the StatusIndicator functional component
export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
    icon,
    color,
    text,
}) => {
    return (
        <div className="center flex items-center justify-center">
            {/* Image component with proper src prop */}
            <Image src={icon} alt="" width={20} height={20} className="mr-2" />
            <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700 dark:text-white">
                    {text}
                </span>
                <span
                    className={`mb-2 flex h-2 w-2 translate-y-1 rounded-full bg-${color}-500`}
                ></span>
            </div>
        </div>
    );
};
