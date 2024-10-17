// Function to check if "auto_archive" action exists and meets the conditions
export function checkAutoArchiveAction(actions: any[]): boolean {
    // Ensure actions array is not empty
    if (!actions || actions.length === 0) {
        console.log("No actions available.");
        return false;
    }

    // Look for the "auto_archive" action
    const autoArchiveAction = actions.find((action: any) => {
        return (
            action.actionType === "auto_archive" &&
            action.condition?.field === "current_stage" && // Check the condition field
            action.condition?.condition === "equals" && // Ensure condition is "equals"
            action.condition?.value === "Hired" // The value we're checking for
        );
    });

    // If auto_archive action exists and meets the conditions, return true
    return !!autoArchiveAction;
}
