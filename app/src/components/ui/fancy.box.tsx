"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandGroup,
    CommandInput,
    CommandItem,
} from "@/components/ui/command";

interface Framework {
    value: string;
    label: string;
    color: string;
}

interface FancyBoxProps {
    fields: Framework[]; // User-provided fields
}

const badgeStyle = (color: string) => ({
    borderColor: `${color}20`,
    backgroundColor: `${color}30`,
    color,
});

// Function to generate random color
const generateRandomColor = () => {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
};

export function FancyBox({ fields }: FancyBoxProps) {
    const inputRef = React.useRef<HTMLInputElement>(null);
    const [openCombobox, setOpenCombobox] = React.useState(false);
    const [inputValue, setInputValue] = React.useState<string>("");
    const [selectedValues, setSelectedValues] = React.useState<Framework[]>([]);

    const toggleFramework = (framework: Framework) => {
        const isAlreadySelected = selectedValues.some(
            (f) => f.value === framework.value,
        );
        if (!isAlreadySelected) {
            framework.color = generateRandomColor(); // Assign random color
            setSelectedValues((prev) => [...prev, framework]);
        } else {
            setSelectedValues((prev) =>
                prev.filter((l) => l.value !== framework.value),
            );
        }
        inputRef?.current?.focus();
    };

    const onComboboxOpenChange = (value: boolean) => {
        inputRef.current?.blur(); // HACK: otherwise, would scroll automatically to the bottom of the page
        setOpenCombobox(value);
    };

    const selectables = fields.filter(
        (field) => !selectedValues.includes(field),
    );

    return (
        <div className="flex ">
            <div className="flex-1">
                <Popover
                    open={openCombobox}
                    onOpenChange={onComboboxOpenChange}
                >
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={openCombobox}
                            className="w-full justify-between text-foreground"
                        >
                            <span className="truncate">
                                {selectedValues.length === 0 && "Select labels"}
                                {selectedValues.length === 1 &&
                                    selectedValues[0].label}
                                {selectedValues.length === 2 &&
                                    selectedValues
                                        .map(({ label }) => label)
                                        .join(", ")}
                                {selectedValues.length > 2 &&
                                    `${selectedValues.length} labels selected`}
                            </span>
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="overflow-y- max-h-[500px]  w-[350px] p-0">
                        <Command loop>
                            <CommandInput
                                ref={inputRef}
                                placeholder="Search labels..."
                                value={inputValue}
                                onValueChange={setInputValue}
                            />
                            <CommandGroup className="overflow-y-auto p-0">
                                {fields.map((field) => {
                                    const isActive = selectedValues.some(
                                        (f) => f.value === field.value,
                                    );
                                    return (
                                        <CommandItem
                                            key={field.value}
                                            value={field.value}
                                            onSelect={() =>
                                                toggleFramework(field)
                                            }
                                        >
                                            <Check
                                                className={cn(
                                                    "mr-2 h-4 w-4",
                                                    isActive
                                                        ? "opacity-100"
                                                        : "opacity-0",
                                                )}
                                            />
                                            <div className="flex-1">
                                                {field.label}
                                            </div>
                                            <div className="h-4 w-4 rounded-full" />
                                        </CommandItem>
                                    );
                                })}
                            </CommandGroup>
                        </Command>
                    </PopoverContent>
                </Popover>
            </div>
            <div className="ml-3 flex flex-col">
                {selectedValues.map(({ label, value, color }) => (
                    <Badge
                        key={value}
                        variant="outline"
                        style={badgeStyle(color)}
                        className="mb-2 h-[44px] w-[360px] "
                    >
                        {label}
                    </Badge>
                ))}
            </div>
        </div>
    );
}
