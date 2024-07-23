/* eslint-disable @typescript-eslint/no-explicit-any */

export interface WorkflowRecipient {
    openingText: string;
    messageFields: string[];
    messageButtons: { label: string; action: string }[];
    messageDelivery: string;
    recipients: any[];
}
