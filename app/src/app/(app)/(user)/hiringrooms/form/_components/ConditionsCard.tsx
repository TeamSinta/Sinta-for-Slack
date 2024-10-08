"use client";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Trash2 } from "lucide-react";
import { ConditionSelector } from "../../../workflows/new/_components/conditionsSelector";
import greenhouselogo from "../../../../../../../public/greenhouseLogo.png";
import { cn } from "@/lib/utils";

// Greenhouse logo component
const GreenhouseLogo = () => (
    <img
        src={greenhouselogo.src}
        alt="Greenhouse Logo"
        className="mr-2 inline-block h-4 w-4"
    />
);
interface Props {
    condition: { id: number; field: string; condition: string; value: string };
    onRemove: () => void;
    fields: Array<{ field: string; description: string; dataType: string }>;
    onFieldSelect: (field: string) => void;
    onConditionSelect: (condition: string) => void;
    onValueChange: (value: string) => void;
    editable: boolean;
}
const ConditionsCard = ({
    condition,
    onRemove,
    fields,
    onFieldSelect,
    onConditionSelect,
    onValueChange,
    editable = true,
}: Props) => {
    return (
        <Card key={condition.id} className="transition-colors duration-500">
            {editable && (
                <CardHeader>
                    <CardTitle className="flex items-center">
                        Condition
                        <Button
                            variant="ghost"
                            onClick={() => onRemove()}
                            className="ml-auto text-red-600 hover:bg-red-100"
                        >
                            <Trash2 className="mr-2" /> Remove
                        </Button>
                    </CardTitle>
                    <CardDescription>
                        Define a condition to filter on.
                    </CardDescription>
                </CardHeader>
            )}

            <CardContent className={cn("space-y-4", !editable && "pt-4")}>
                <div className="flex flex-col space-y-2">
                    {/* Field Selector */}
                    {editable ? (
                        <ConditionSelector
                            attributes={fields}
                            selectedField={condition.field} // Pre-fill selected field
                            onFieldSelect={(value) => onFieldSelect(value)}
                        />
                    ) : (
                        <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={open}
                            aria-label="Select a condition"
                            className="flex w-full flex-row gap-2 rounded disabled:opacity-100"
                            disabled
                        >
                            <GreenhouseLogo />
                            {condition.field}
                        </Button>
                    )}

                    {/* Condition Selector */}
                    <Select
                        value={condition.condition}
                        onValueChange={(value) => onConditionSelect(value)}
                        disabled={!editable}
                    >
                        <SelectTrigger className="mt-1 w-full rounded disabled:cursor-default disabled:opacity-100">
                            <SelectValue placeholder="Choose condition..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="contains">
                                (Text) Contains
                            </SelectItem>
                            <SelectItem value="not_contains">
                                (Text) Does not contain
                            </SelectItem>
                            <SelectItem value="exactly_matches">
                                (Text) Exactly matches
                            </SelectItem>
                            {/* Add more items as needed */}
                        </SelectContent>
                    </Select>

                    {/* Value Input */}
                    <input
                        type="text"
                        value={condition.value}
                        onChange={(e) => onValueChange(e.target.value)}
                        placeholder="Enter value"
                        className="text-md mt-1 w-full rounded border p-1 px-2"
                        disabled={!editable}
                    />
                </div>
            </CardContent>
        </Card>
    );
};

export default ConditionsCard;
