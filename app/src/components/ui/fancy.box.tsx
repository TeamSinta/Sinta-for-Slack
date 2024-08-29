// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
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
    selectedOptions: string[]; // Currently selected options
    onOptionChange: (selectedOptions: string[]) => void; // Callback function for option change
}

const generateRandomColor = () => {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
};

export function FancyBox({
    fields,
    selectedOptions,
    onOptionChange,
}: FancyBoxProps) {
    const inputRef = React.useRef<HTMLInputElement>(null);
    const [openCombobox, setOpenCombobox] = React.useState(false);
    const [inputValue, setInputValue] = React.useState<string>("");
    const [selectedValues, setSelectedValues] = React.useState<Framework[]>([]);

    // Set selectedValues initially based on the selectedOptions passed from props
    React.useEffect(() => {
        const initialSelectedValues = fields.filter((field) =>
            selectedOptions.includes(field.value),
        );
        setSelectedValues(initialSelectedValues);
    }, [fields, selectedOptions]);

    const toggleFramework = (framework: Framework) => {
        const isAlreadySelected = selectedValues.some(
            (f) => f.value === framework.value,
        );
        let updatedSelectedValues = [...selectedValues];
        if (!isAlreadySelected) {
            framework.color = generateRandomColor(); // Assign random color
            updatedSelectedValues.push(framework);
        } else {
            updatedSelectedValues = updatedSelectedValues.filter(
                (l) => l.value !== framework.value,
            );
        }
        setSelectedValues(updatedSelectedValues);

        // Update selectedOptions by extracting values from updatedSelectedValues
        const updatedSelectedOptions = updatedSelectedValues.map(
            (value) => value.value,
        );
        onOptionChange(updatedSelectedOptions);

        inputRef?.current?.focus();
    };

    const onComboboxOpenChange = (value: boolean) => {
        inputRef.current?.blur(); // HACK: otherwise, would scroll automatically to the bottom of the page
        setOpenCombobox(value);
    };

    return (
        <div className="flex-1">
            <Popover open={openCombobox} onOpenChange={onComboboxOpenChange}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openCombobox}
                        className="w-full justify-between text-foreground"
                    >
                        <span className="truncate">
                            {selectedValues.length === 0 && "Message Fields"}
                            {selectedValues.length === 1 &&
                                selectedValues[0]?.label}
                            {selectedValues.length === 2 &&
                                selectedValues
                                    .map(({ label }) => label)
                                    .join(", ")}
                            {selectedValues.length > 2 &&
                                `${selectedValues.length} fields selected`}
                        </span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="max-h-[500px] w-[350px] overflow-y-auto p-0">
                    <Command loop>
                        <CommandInput
                            ref={inputRef}
                            placeholder="Search Fields..."
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
                                        onSelect={() => toggleFramework(field)}
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
    );
}
