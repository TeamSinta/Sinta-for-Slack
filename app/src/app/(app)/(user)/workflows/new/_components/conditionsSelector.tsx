"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { CheckIcon, SeparatorHorizontalIcon } from "lucide-react";
import { PopoverProps } from "@radix-ui/react-popover";
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card";
import greenhouselogo from "../../../../../../../public/greenhouseLogo.png";

// Greenhouse logo component
const GreenhouseLogo = () => (
    <img
        src={greenhouselogo.src}
        alt="Greenhouse Logo"
        className="mr-2 inline-block h-4 w-4"
    />
);

interface ConditionSelectorProps extends PopoverProps {
    attributes: any[];
    onFieldSelect: (selectedField: string) => void;
}

export function ConditionSelector({
    attributes,
    onFieldSelect,
    ...props
}: ConditionSelectorProps) {
    const [open, setOpen] = React.useState(false); // Popover open state
    const [selectedAttribute, setSelectedAttribute] = React.useState(
        attributes[0],
    ); // Selected attribute state
    const [hoveredAttribute, setHoveredAttribute] = React.useState<
        string | null
    >(null); // Hovered attribute state

    const handleSelectAttribute = (attribute: any) => {
        setSelectedAttribute(attribute);
        onFieldSelect(attribute.field); // Pass the selected field to the parent component
        setOpen(false); // Close the popover after selection
    };

    return (
        <Popover open={open} onOpenChange={setOpen} {...props}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    aria-label="Select a condition"
                    className="w-full justify-between rounded"
                >
                    {selectedAttribute ? (
                        <>
                            <GreenhouseLogo />
                            {selectedAttribute.field}
                        </>
                    ) : (
                        "Select a condition..."
                    )}
                    <SeparatorHorizontalIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>

            <PopoverContent align="start" className="w-[500px] p-0">
                <Command loop>
                    <CommandList className="h-[var(--cmdk-list-height)] max-h-[400px]">
                        <CommandInput placeholder="Search Conditions..." />
                        <CommandEmpty>No conditions found.</CommandEmpty>

                        <CommandGroup heading="Conditions">
                            {attributes.map((attribute) => (
                                <div
                                    key={attribute.field}
                                    onMouseEnter={() =>
                                        setHoveredAttribute(attribute.field)
                                    } // Set hovered attribute
                                    onMouseLeave={() =>
                                        setHoveredAttribute(null)
                                    } // Reset hovered attribute
                                >
                                    <HoverCard
                                        open={
                                            hoveredAttribute === attribute.field
                                        }
                                    >
                                        {" "}
                                        {/* Open only if hovered */}
                                        <HoverCardTrigger asChild>
                                            <div>
                                                <AttributeItem
                                                    attribute={attribute}
                                                    isSelected={
                                                        selectedAttribute?.field ===
                                                        attribute.field
                                                    }
                                                    onSelect={() =>
                                                        handleSelectAttribute(
                                                            attribute,
                                                        )
                                                    }
                                                />
                                            </div>
                                        </HoverCardTrigger>
                                        <HoverCardContent
                                            side="right"
                                            sideOffset={10}
                                            align="start"
                                            className="min-h-[280px]"
                                        >
                                            <div className="grid gap-2">
                                                <h4 className="font-medium leading-none">
                                                    {attribute.field}
                                                </h4>
                                                <div className="text-sm text-muted-foreground">
                                                    {attribute.description}
                                                </div>
                                            </div>
                                        </HoverCardContent>
                                    </HoverCard>
                                </div>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}

interface AttributeItemProps {
    attribute: { field: string; description: string };
    isSelected: boolean;
    onSelect: () => void;
}

function AttributeItem({
    attribute,
    isSelected,
    onSelect,
}: AttributeItemProps) {
    return (
        <CommandItem
            key={attribute.field}
            onSelect={onSelect}
            className="data-[selected=true]:bg-gray-100 data-[selected=true]:text-black"
        >
            <GreenhouseLogo />
            {attribute.field}
            <CheckIcon
                className={cn(
                    "ml-auto h-4 w-4",
                    isSelected ? "opacity-100" : "opacity-0",
                )}
            />
        </CommandItem>
    );
}
