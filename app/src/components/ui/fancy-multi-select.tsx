import * as React from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Command, CommandGroup, CommandItem } from "@/components/ui/command";
import { Command as CommandPrimitive } from "cmdk";
import Image from "next/image";
import slackLogo from "../../../public/slack-logo.png";

type Option = { value: string; label: string };

interface FancyMultiSelectProps {
    options?: Option[]; // Mark the prop as optional
    selectedOptions: string[]; // Selected options
    onOptionChange: (selectedOptions: string[]) => void; // Function to handle option change
}

export function FancyMultiSelect({
    options = [],
    selectedOptions,
    onOptionChange,
}: FancyMultiSelectProps) {
    const inputRef = React.useRef<HTMLInputElement>(null);
    const [open, setOpen] = React.useState(false);
    const [inputValue, setInputValue] = React.useState("");

    const handleUnselect = React.useCallback(
        (option: Option) => {
            const updatedOptions = selectedOptions.filter(
                (opt) => opt !== option.value,
            );
            onOptionChange(updatedOptions);
        },
        [selectedOptions, onOptionChange],
    );

    const handleKeyDown = React.useCallback(
        (e: React.KeyboardEvent<HTMLDivElement>) => {
            const input = inputRef.current;
            if (input) {
                if (e.key === "Delete" || e.key === "Backspace") {
                    if (input.value === "") {
                        const lastSelectedOption = options.find((opt) =>
                            selectedOptions.includes(opt.value),
                        );
                        if (lastSelectedOption) {
                            handleUnselect(lastSelectedOption);
                        }
                    }
                }
                if (e.key === "Escape") {
                    input.blur();
                }
            }
        },
        [options, selectedOptions, handleUnselect],
    );

    const selectables = options.filter(
        (option) => !selectedOptions.includes(option.value),
    );

    return (
        <Command
            onKeyDown={handleKeyDown}
            className="overflow-visible bg-transparent"
        >
            <div className="group rounded-md border border-input px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                <div className="flex flex-wrap gap-1">
                    {selectedOptions.map((optionValue) => {
                        const option = options.find(
                            (opt) => opt.value === optionValue,
                        );
                        if (option) {
                            return (
                                <Badge key={option.value} variant="secondary">
                                    <Image
                                        src={slackLogo}
                                        alt="slack-logo"
                                        className="mr-1 h-4 w-4"
                                    />
                                    {option.label}

                                    <button
                                        className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                handleUnselect(option);
                                            }
                                        }}
                                        onMouseDown={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                        }}
                                        onClick={() => handleUnselect(option)}
                                    >
                                        <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                                    </button>
                                </Badge>
                            );
                        }
                        return null;
                    })}
                    <CommandPrimitive.Input
                        ref={inputRef}
                        value={inputValue}
                        onValueChange={setInputValue}
                        onBlur={() => setOpen(false)}
                        onFocus={() => setOpen(true)}
                        placeholder="Select options..."
                        className="ml-2 flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
                    />
                </div>
            </div>
            <div className="relative mt-2">
                {open && selectables.length > 0 ? (
                    <div className="absolute top-0 z-10 w-full rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in">
                        <CommandGroup className="h-full overflow-auto">
                            {selectables.map((option) => {
                                return (
                                    <CommandItem
                                        key={option.value}
                                        onMouseDown={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                        }}
                                        onSelect={() => {
                                            setInputValue("");
                                            onOptionChange([
                                                ...selectedOptions,
                                                option.value,
                                            ]);
                                        }}
                                        className={"cursor-pointer"}
                                    >
                                        {option.label}
                                    </CommandItem>
                                );
                            })}
                        </CommandGroup>
                    </div>
                ) : null}
            </div>
        </Command>
    );
}
