export interface WorkflowRecipient {
    openingText: string;
    messageFields: string[];
    messageButtons: { label: string; action: string }[];
    messageDelivery: string;
    recipients: any[];
    // recipients: string[];
}
