//@ts-nocheck
import { CONDITIONS_OPTIONS, DataType } from "./conditions-options";

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
    return checkConditions(
        application.payload,
        conditions,
        getFieldFromApplication,
    );
}

export function checkConditions(
    application: any,
    conditions: any[],
    getter: (application: any, field: string) => any,
) {
    // console.log("CONDITIONS", conditions);
    // console.log("APPLICATIONS", application);
    let result = true;
    // Iterate through all conditions
    for (const item of conditions) {
        // console.log("PROCESSING CONDITION", item);
        const {
            field,
            condition,
            value,
        }: {
            field: string;
            condition: keyof typeof CONDITIONS_OPTIONS;
            value: any;
        } = item;
        // Get the candidate's data field using the utility function
        const candidateField = getter(application, field);
        // console.log("CANDIDATE FIELD", field, candidateField);
        // Handle if the field is not found
        if (candidateField === undefined) {
            console.warn(`Field ${field} not found in application.`);
            return false;
        }
        if (!evaluateCondition(condition, value, candidateField, field))
            result = false;
    }
    return result;
}

export function evaluateCondition(
    condition: keyof typeof CONDITIONS_OPTIONS,
    value: any,
    inputValue: any,
    field: string,
): boolean {
    // Compare candidate field with condition's value based on the operator
    const conditionOption = CONDITIONS_OPTIONS[condition];
    if (!conditionOption) {
        console.warn(`Unknown operator: ${condition}`);
        return false;
    }

    // Validate the data type (optional)
    const isValidType = conditionOption.dataType.some((type: string) => {
        if (type === DataType.TEXT) return typeof inputValue === "string";
        if (type === DataType.NUMBER) return typeof inputValue === "number";
        if (type === DataType.DATETIME)
            return !isNaN(new Date(inputValue).getTime());
        if (type === DataType.BOOLEAN) return true;
        if (type === DataType.ARRAY_OF_STRINGS)
            return (
                Array.isArray(inputValue) &&
                inputValue.every((item) => typeof item === "string")
            );
        if (type === DataType.ARRAY_OF_NUMBERS)
            return (
                Array.isArray(inputValue) &&
                inputValue.every((item) => typeof item === "number")
            );
        if (type === DataType.ARRAY_OF_OBJECTS)
            return Array.isArray(inputValue);
    });

    if (!isValidType) {
        console.warn(`Invalid data type for condition: ${condition}`);
        return false;
    }

    let propertyKey;
    if (conditionOption.dataType.includes(DataType.ARRAY_OF_OBJECTS)) {
        propertyKey = field.split(".").pop();
    }
    return conditionOption.evaluator(inputValue, value, propertyKey);
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
