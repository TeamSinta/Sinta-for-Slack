import offerAttributes from "./offer-attributes.json"; // This is where your JSON file for offers is stored
import candidateAttributes from "./candidate-attributes.json"; // This is for the candidate attributes
import interviewAttributes from "./interview-attributes.json"; // This is for the interview attributes

// Extended Enum for Conditions data types
export const DataType = {
    TEXT: "string",
    NUMBER: "number",
    DATETIME: "date",
    BOOLEAN: "boolean",
    ARRAY_OF_STRINGS: "arrayOfStrings", // Like ["hello", "world"]
    ARRAY_OF_NUMBERS: "arrayOfNumbers", // Like [1, 2, 3]
    ARRAY_OF_OBJECTS: "arrayOfObjects", // Like [{name: "John", age: 30}, {name: "Jane", age: 25}]
};

// Type definitions for the possible values
export type Primitive = string | number | boolean | Date;

// Array types
export type ArrayOfStrings = string[];
export type ArrayOfNumbers = number[];
export type ArrayOfObjects = Record<
    string,
    Primitive | ArrayOfStrings | ArrayOfNumbers
>[];

// Define a union  type for `inputValue` and `value`
export type ConditionInputValue =
    | Primitive
    | ArrayOfStrings
    | ArrayOfNumbers
    | ArrayOfObjects;

export const CONDITIONS_ATTRIBUTES_LOOKUP = {
    offers: offerAttributes.offer.attributes,
    candidates: candidateAttributes.candidate.attributes,
    interviews: interviewAttributes.interview.attributes,
};

export const getConditionFieldDataType = (
    field: string,
    objectField: "offers" | "candidates" | "interviews",
) => {
    const fields = CONDITIONS_ATTRIBUTES_LOOKUP[objectField.toLowerCase()];
    if (!fields) {
        return null;
    }
    const item = fields.find((item) => item.field === field);

    if (item) {
        return item.dataType ?? null;
    }
    return null;
};

// Conditions object with evaluators
export const CONDITIONS_OPTIONS = {
    equals: {
        evaluator: (inputValue: Primitive, value: Primitive) =>
            inputValue === value,
        dataType: [
            DataType.TEXT,
            DataType.NUMBER,
            DataType.DATETIME,
            DataType.BOOLEAN,
        ],
        label: "Exactly matches",
    },
    not_equals: {
        evaluator: (inputValue: Primitive, value: Primitive) =>
            inputValue !== value,
        dataType: [
            DataType.TEXT,
            DataType.NUMBER,
            DataType.DATETIME,
            DataType.BOOLEAN,
        ],
        label: "Does not exactly match",
    },
    contains: {
        evaluator: (inputValue: string, value: string) =>
            typeof inputValue === "string" && inputValue.includes(value),
        dataType: [DataType.TEXT],
        label: "Contains",
    },
    not_contains: {
        evaluator: (inputValue: string, value: string) =>
            typeof inputValue === "string" && !inputValue.includes(value),
        dataType: [DataType.TEXT],
        label: "Does not contain",
    },
    starts_with: {
        evaluator: (inputValue: string, value: string) =>
            typeof inputValue === "string" && inputValue.startsWith(value),
        dataType: [DataType.TEXT],
        label: "Starts with",
    },
    not_starts_with: {
        evaluator: (inputValue: string, value: string) =>
            typeof inputValue === "string" && !inputValue.startsWith(value),
        dataType: [DataType.TEXT],
        label: "Does not start with",
    },
    ends_with: {
        evaluator: (inputValue: string, value: string) =>
            typeof inputValue === "string" && inputValue.endsWith(value),
        dataType: [DataType.TEXT],
        label: "Ends with",
    },
    greater_than: {
        evaluator: (inputValue: number, value: number) =>
            typeof inputValue === "number" && inputValue > value,
        dataType: [DataType.NUMBER],
        label: "Greater than",
    },
    less_than: {
        evaluator: (inputValue: number, value: number) =>
            typeof inputValue === "number" && inputValue < value,
        dataType: [DataType.NUMBER],
        label: "Less than",
    },
    after: {
        evaluator: (inputValue: Date, value: Date) =>
            new Date(inputValue) > new Date(value),
        dataType: [DataType.DATETIME],
        label: "After",
    },
    before: {
        evaluator: (inputValue: Date, value: Date) =>
            new Date(inputValue) < new Date(value),
        dataType: [DataType.DATETIME],
        label: "Before",
    },
    is_true: {
        evaluator: (inputValue: boolean) => Boolean(inputValue),
        dataType: [DataType.BOOLEAN],
        label: "is True",
    },
    is_false: {
        evaluator: (inputValue: boolean) => !Boolean(inputValue),
        dataType: [DataType.BOOLEAN],
        label: "is False",
    },
    exists: {
        evaluator: (inputValue: ConditionInputValue) =>
            inputValue !== undefined && inputValue !== null,
        dataType: [
            DataType.TEXT,
            DataType.NUMBER,
            DataType.DATETIME,
            DataType.BOOLEAN,
            DataType.ARRAY_OF_NUMBERS,
            DataType.ARRAY_OF_STRINGS,
            DataType.ARRAY_OF_OBJECTS,
        ],
        label: "Exists",
    },
    does_not_exist: {
        evaluator: (inputValue: ConditionInputValue) =>
            inputValue === undefined || inputValue === null,
        dataType: [
            DataType.TEXT,
            DataType.NUMBER,
            DataType.DATETIME,
            DataType.BOOLEAN,
            DataType.ARRAY_OF_NUMBERS,
            DataType.ARRAY_OF_STRINGS,
            DataType.ARRAY_OF_OBJECTS,
        ],
        label: "Does not exist",
    },
    // Example of condition targeting an array of objects and a property within
    all_property_equals: {
        evaluator: (
            inputValue: ArrayOfObjects,
            value: Primitive,
            propertyKey: string,
        ) =>
            Array.isArray(inputValue) &&
            inputValue.every((item) => item[propertyKey] === value),
        dataType: [DataType.ARRAY_OF_OBJECTS],
        label: "Every item equals",
    },
    any_property_equals: {
        evaluator: (
            inputValue: ArrayOfObjects,
            value: Primitive,
            propertyKey: string,
        ) =>
            Array.isArray(inputValue) &&
            inputValue.some((item) => item[propertyKey] === value),
        dataType: [DataType.ARRAY_OF_OBJECTS],
        label: "Any item equals",
    },
    no_property_equals: {
        evaluator: (
            inputValue: ArrayOfObjects,
            value: Primitive,
            propertyKey: string,
        ) =>
            Array.isArray(inputValue) &&
            inputValue.every((item) => item[propertyKey] !== value),
        dataType: [DataType.ARRAY_OF_OBJECTS],
        label: "No item equals",
    },
    all_text_contains: {
        evaluator: (inputValue: ArrayOfStrings, value: string) =>
            Array.isArray(inputValue) &&
            inputValue.every((item) => item.includes(value)),
        dataType: [DataType.ARRAY_OF_STRINGS],
        label: "All text items contain",
    },
    any_text_contains: {
        evaluator: (inputValue: ArrayOfStrings, value: string) =>
            Array.isArray(inputValue) &&
            inputValue.some((item) => item.includes(value)),
        dataType: [DataType.ARRAY_OF_STRINGS],
        label: "Any text item contains",
    },
    all_numbers_greater_than: {
        evaluator: (inputValue: ArrayOfNumbers, value: number) =>
            Array.isArray(inputValue) &&
            inputValue.every((item) => item > value),
        dataType: [DataType.ARRAY_OF_NUMBERS],
        label: "All numbers greater than",
    },
    any_number_greater_than: {
        evaluator: (inputValue: ArrayOfNumbers, value: number) =>
            Array.isArray(inputValue) &&
            inputValue.some((item) => item > value),
        dataType: [DataType.ARRAY_OF_NUMBERS],
        label: "Any number greater than",
    },
    all_numbers_less_than: {
        evaluator: (inputValue: ArrayOfNumbers, value: number) =>
            Array.isArray(inputValue) &&
            inputValue.every((item) => item < value),
        dataType: [DataType.ARRAY_OF_NUMBERS],
        label: "All numbers less than",
    },
    any_number_less_than: {
        evaluator: (inputValue: ArrayOfNumbers, value: number) =>
            Array.isArray(inputValue) &&
            inputValue.some((item) => item < value),
        dataType: [DataType.ARRAY_OF_NUMBERS],
        label: "Any number less than",
    },
    array_length_equals: {
        evaluator: (inputValue: ArrayOfObjects, value: number) =>
            Array.isArray(inputValue) && inputValue.length === value,
        dataType: [
            DataType.ARRAY_OF_NUMBERS,
            DataType.ARRAY_OF_STRINGS,
            DataType.ARRAY_OF_OBJECTS,
        ],
        label: "Count equals",
    },
    array_length_greater_than: {
        evaluator: (inputValue: ArrayOfObjects, value: number) =>
            Array.isArray(inputValue) && inputValue.length > value,
        dataType: [
            DataType.ARRAY_OF_NUMBERS,
            DataType.ARRAY_OF_STRINGS,
            DataType.ARRAY_OF_OBJECTS,
        ],
        label: "Count greater than",
    },
    array_length_less_than: {
        evaluator: (inputValue: ArrayOfObjects, value: number) =>
            Array.isArray(inputValue) && inputValue.length < value,
        dataType: [
            DataType.ARRAY_OF_NUMBERS,
            DataType.ARRAY_OF_STRINGS,
            DataType.ARRAY_OF_OBJECTS,
        ],
        label: "Count less than",
    },
};

/* Some more options
property_equals_all: Checks if a particular property of all objects in the array equals a given value.
Example: Check if all interviewers have response_status equal to "accepted".

property_equals_any: Checks if any object in the array has a particular property equal to a given value.
Example: Check if any interviewer has an employee_id equal to "1234".

property_includes_all: Checks if a particular property (assumed to be a string or array) of each object includes a given value (or values).
Example: Check if all interviewers' email includes "@company.com".

property_includes_any: Checks if at least one object in the array has a particular property that includes a given value.
Example: Check if any interviewer’s name includes the word "Manager".

property_starts_with_all: Checks if a particular property of all objects starts with a specified value.
Example: Check if all interviewers’ employee_id start with "9".

property_starts_with_any: Checks if any object’s property starts with a specified value.
Example: Check if any interviewer’s name starts with "Dr.".

property_ends_with_all: Checks if a particular property of all objects ends with a specified value.
Example: Check if all interviewers' email addresses end with ".com".

property_ends_with_any: Checks if any object’s property ends with a specified value.
Example: Check if any interviewer’s response_status ends with "pending".

property_greater_than_all: Checks if a numerical property of all objects is greater than a given value.
Example: Check if all employees' years_of_experience is greater than 5.

property_less_than_any: Checks if any numerical property of objects is less than a given value.
Example: Check if any interviewer’s age is less than 30.

property_exists_in_all: Checks if a particular property exists in all objects in the array.
Example: Check if every interviewer has a phone_number property defined.

property_exists_in_any: Checks if a particular property exists in at least one object.
Example: Check if any interviewer has a department property.

property_does_not_exist_in_all: Checks if a particular property does not exist in all objects.
Example: Check if none of the interviewers have a middle_name property.

property_does_not_exist_in_any: Checks if a particular property does not exist in any of the objects.
Example: Check if no interviewers have a nickname property.

length_equals: Checks if the length of the array equals a specified value.
Example: Check if there are exactly 5 interviewers.

length_greater_than: Checks if the length of the array is greater than a specified value.
Example: Check if there are more than 3 interviewers.

length_less_than: Checks if the length of the array is less than a specified value.
Example: Check if there are fewer than 10 candidates in the list.

unique_property_values: Checks if all objects in the array have unique values for a specified property.
Example: Check if all interviewers have unique email addresses.

contains_object_with_properties: Checks if the array contains an object that matches a set of properties.
Example: Check if there is an interviewer object with { name: "Alice", employee_id: "1234" }.

none_property_matches: Checks if none of the objects in the array have a property that matches a given condition.
Example: Check if none of the interviewers have response_status set to "rejected".
*/
