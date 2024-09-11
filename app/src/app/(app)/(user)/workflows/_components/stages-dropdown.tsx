import React, { useState, useEffect } from "react";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { fetchStagesForJob } from "@/server/greenhouse/core";

interface Stage {
    id: number;
    name: string;
}

interface StagesDropdownProps {
    jobId: string;
    onStageSelect: (stageId: string, stageLabel: string) => void;
    selectedStage: string;
}

const StagesDropdown: React.FC<StagesDropdownProps> = ({
    jobId,
    onStageSelect,
    selectedStage,
}) => {
    const [stages, setStages] = useState<Stage[]>([]);

    useEffect(() => {
        const fetchStages = async () => {
            if (jobId) {
                const stages = await fetchStagesForJob(jobId);
                setStages(stages);
            }
        };
        void fetchStages();
    }, [jobId]);

    return (
        <div className="flex-1">
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Select Stage
            </Label>
            <Select
                onValueChange={(value) => {
                    const selectedStage = stages.find(
                        (stage) => stage.id.toString() === value,
                    );
                    if (selectedStage) {
                        onStageSelect(
                            selectedStage.id.toString(),
                            selectedStage.name,
                        );
                    }
                }}
                defaultValue={selectedStage ?? undefined}
            >
                <SelectTrigger className="w-full border border-gray-300 bg-white">
                    <SelectValue placeholder="Select Stage" />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        {stages.map((stage) => (
                            <SelectItem
                                key={stage.id}
                                value={stage.id.toString()}
                            >
                                {stage.name}
                            </SelectItem>
                        ))}
                    </SelectGroup>
                </SelectContent>
            </Select>
        </div>
    );
};

export default StagesDropdown;
