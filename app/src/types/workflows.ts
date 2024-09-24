/* eslint-disable @typescript-eslint/no-explicit-any */

export interface WorkflowRecipient {
    openingText: string;
    messageFields: string[];
    messageButtons: { label: string; action: string }[];
    messageDelivery: string;
    recipients: any[];
}

interface ConditionField {
    label?: string;
    value?: string;
}

export interface Condition {
    id?: string;
    field: string | ConditionField;
    value: string;
    condition: string;
    condition_type: "Main" | "Add-on";
}

export interface MainCondition {
    stage?: string;
    days?: string;
}
