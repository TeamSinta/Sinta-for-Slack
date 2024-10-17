import React from "react";
import Image from "next/image";
import { type WorkflowData } from "./columns"; // Adjust to your actual import
import greenhouseLogo from "../../../../../../public/greenhouselogo.png";
import slackLogo from "../../../../../../public/slack-logo.png";
import filterIcon from "../../../../../../public/filter.png";

type IntegrationsCellProps = {
    workflow: WorkflowData;
};

const IntegrationsCell: React.FC<IntegrationsCellProps> = ({ workflow }) => {
    const icons = [
        { src: greenhouseLogo, alt: "Greenhouse" },
        ...Array(workflow.conditions.length).fill({
            src: filterIcon,
            alt: "Condition",
        }),
        { src: slackLogo, alt: "Slack" },
    ];

    return (
        <div className="flex items-center justify-center space-x-2 rounded-sm bg-gray-100 px-2 py-3 shadow-sm dark:bg-gray-800">
            {icons.map((icon, index) => (
                <div
                    key={index}
                    className="flex items-center justify-center rounded-md bg-white p-2 shadow dark:bg-gray-900"
                >
                    <Image
                        src={icon.src}
                        alt={icon.alt}
                        width={20}
                        height={20}
                        className="rounded-md"
                    />
                </div>
            ))}
        </div>
    );
};

export default IntegrationsCell;
