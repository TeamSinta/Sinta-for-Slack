export function extractCurrentStage(application: any): string | null {
    if (
        application &&
        application.payload &&
        application.payload.application &&
        application.payload.application.current_stage &&
        application.payload.application.current_stage.id
    ) {
        return application.payload.application.current_stage.id; // Accessing the stage id
    }
    return null;
}
// Function to check if the candidate meets the workflow conditions
export function checkCandidateAgainstConditions(
    application: any,
    conditions: any[],
): boolean {
    return checkCondtions(application, conditions, getFieldFromApplication);
}

export function checkCondtions(
    application: any,
    conditions: any[],
    getter: (application: any, field: string) => any,
) {
    // Iterate through all conditions
    for (const condtion of conditions) {
        const { field, condition, value } = condtion;
        const payload = application.payload;
        // Get the candidate's data field using the utility function
        const candidateField = getter(payload, field);

        // Handle if the field is not found
        if (candidateField === undefined) {
            console.warn(`Field ${field} not found in application.`);
            return false;
        }
        if (!evaluateCondition(condition, value, candidateField)) return false;
    }
    // If all conditions are met
    return true;
}

export function evaluateCondition(
    condition: string,
    value: any,
    inputValue: any,
): Boolean {
    // Compare candidate field with condition's value based on the operator
    switch (condition) {
        case "equals":
            return inputValue === value;
        case "not_equals":
            return inputValue !== value;
        case "contains":
            return typeof inputValue === "string" && inputValue.includes(value);
        case "not_contains":
            return (
                typeof inputValue === "string" && !inputValue.includes(value)
            );
        case "exactly_matches":
            return typeof inputValue === "string" && inputValue === value;

        case "not_exactly_matches":
            return typeof inputValue === "string" && inputValue !== value;
        case "starts_with":
            return (
                typeof inputValue === "string" && inputValue.startsWith(value)
            );

        case "not_starts_with":
            return (
                typeof inputValue === "string" && !inputValue.startsWith(value)
            );

        case "ends_with":
            return typeof inputValue === "string" && inputValue.endsWith(value);

        case "greater_than":
            return typeof inputValue === "number" && inputValue > value;

        case "less_than":
            return typeof inputValue === "number" && inputValue < value;
        case "after":
            return new Date(inputValue) > new Date(value);
        case "before":
            return new Date(inputValue) < new Date(value);
        case "is_true":
            return Boolean(inputValue);
        case "is_false":
            return !Boolean(inputValue);
        case "exists":
            return inputValue !== undefined && inputValue !== null;
        case "does_not_exist":
            return inputValue === undefined || inputValue === null;
        default:
            console.warn(`Unknown operator: ${condition}`);
            return false;
    }
}

export function getFieldFromApplication(application: any, field: string): any {
    // Helper function to traverse object paths
    const traverseObject = (obj: any, path: string): any => {
        const fieldParts = path.split(".");

        let currentValue: any = obj;
        for (const part of fieldParts) {
            if (!currentValue) return null; // If part of the path doesn't exist, return null

            // Handle array indexing if it's in the format field[index]
            const arrayMatch = part.match(/(\w+)\[(\d+)\]/);
            if (arrayMatch) {
                const arrayField = arrayMatch[1] as string; // The field name before brackets
                const index = parseInt(arrayMatch[2] || "", 10); // The index inside the brackets
                currentValue = currentValue[arrayField]?.[index];
            } else {
                // Normal field lookup
                currentValue = currentValue[part];
            }
        }

        return currentValue;
    };
    // Check `application` level fields first
    const appValue = traverseObject(application.application, field);
    if (appValue !== undefined && appValue !== null) {
        console.log(`Field ${field} found in application`);
        return appValue;
    }
    // Check `candidate` fields
    const candidateValue = traverseObject(
        application.application?.candidate,
        field,
    );
    if (candidateValue !== undefined && candidateValue !== null) {
        console.log(`Field ${field} found in candidate`);
        return candidateValue;
    }
    // Check `jobs` fields (iterate through jobs array)
    if (application.application?.jobs) {
        for (const job of application.application.jobs) {
            const jobValue = traverseObject(job, field);
            if (jobValue !== undefined && jobValue !== null) {
                console.log(`Field ${field} found in jobs`);
                return jobValue;
            }
        }
    }
    // If nothing is found, return null
    console.log(`Field ${field} not found in application, candidate, or jobs.`);
    return null;
}

// Function to schedule a task using a cron system (pseudo-code for now)

export function extractDaysFromConditions(conditions: any[]): number {
    // Initialize default value for number of days
    let days = 0;

    // Iterate through the conditions
    for (const condition of conditions) {
        if (condition.conditionType === "main" && condition.unit === "Days") {
            // Parse the value field as a number
            const daysValue = parseInt(condition.value, 10);

            if (!isNaN(daysValue)) {
                days = daysValue;
                break; // Assume there's only one main condition with days
            }
        }
    }

    return days; // Return the number of days found, or 0 if none
}
