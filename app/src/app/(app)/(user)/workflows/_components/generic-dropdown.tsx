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

interface DropdownItem {
    id: string | number;
    name: string;
}

interface GenericDropdownProps {
    fetcher: () => Promise<DropdownItem[]>; // Fetch function for the dropdown data
    onItemSelect: (id: string, label: string) => void; // Function to handle selection
    label: string; // Label for the dropdown
    selectedItem?: string; // Optionally pass the selected item
}

const GenericDropdown: React.FC<GenericDropdownProps> = ({
    fetcher,
    onItemSelect,
    label,
    selectedItem,
}) => {
    const [items, setItems] = useState<DropdownItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            const data = await fetcher();
            console.log("FETCHED DATA IN DROPDOWN", data);
            setItems(data);
            setIsLoading(false);
        };

        void fetchData();
    }, [fetcher]);

    return (
        <div className="flex-1">
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {label}
            </Label>
            <Select
                onValueChange={(value) => {
                    const selected = items.find(
                        (item) => item.id.toString() === value,
                    );
                    if (selected) {
                        onItemSelect(selected.id.toString(), selected.name);
                    }
                }}
                value={selectedItem ?? undefined}
                disabled={isLoading}
            >
                <SelectTrigger className="w-full border border-gray-300 bg-white">
                    {isLoading ? (
                        <div>Loading...</div>
                    ) : (
                        <SelectValue placeholder={`Select ${label}`} />
                    )}
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        {items.map((item) => (
                            <SelectItem
                                key={item.id}
                                value={item.id.toString()}
                            >
                                {item.name}
                            </SelectItem>
                        ))}
                    </SelectGroup>
                </SelectContent>
            </Select>
        </div>
    );
};

export default GenericDropdown;
