import React, { useEffect, useState } from "react";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { fetchJobsFromGreenhouse } from "@/server/greenhouse/core";

interface Job {
    id: number;
    name: string;
}

interface JobsDropdownProps {
    onJobSelect: (jobId: string) => void;
    selectedJob: string;
}

const JobsDropdown: React.FC<JobsDropdownProps> = ({
    onJobSelect,
    selectedJob,
}) => {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchJobs = async () => {
            const jobs = await fetchJobsFromGreenhouse();
            setJobs(jobs);
            setIsLoading(false);
        };
        void fetchJobs();
    }, []);

    return (
        <div className="flex-1">
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Select Job{" "}
            </Label>
            <Select
                onValueChange={(value) => onJobSelect(value)}
                value={selectedJob ?? undefined}
                disabled={isLoading}
            >
                <SelectTrigger className="w-full border border-gray-300 bg-white">
                    {isLoading ? (
                        <div>Loading...</div>
                    ) : (
                        <SelectValue placeholder={"Select Greenhouse Job"} />
                    )}
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        {jobs.map((job) => (
                            <SelectItem key={job.id} value={job.id.toString()}>
                                {job.name}
                            </SelectItem>
                        ))}
                    </SelectGroup>
                </SelectContent>
            </Select>
        </div>
    );
};

export default JobsDropdown;
