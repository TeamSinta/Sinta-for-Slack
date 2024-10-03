// Run this test with command: `npx jest`

import { evaluateCondition } from "../utils/workflows";
import { CONDITIONS_OPTIONS, DataType } from "../utils/conditions-options";
import { describe, it, expect } from "@jest/globals";

const interviewObject = {
    id: 9019193008,
    application_id: 12378861008,
    external_event_id: "0q62pb7n4e241016smdhbv161v",
    start: { date_time: "2024-10-02T19:30:00.000Z" },
    end: { date_time: "2024-10-02T20:00:00.000Z" },
    location: null,
    video_conferencing_url: "https://meet.google.com/fkk-jfcd-rjh",
    status: "scheduled",
    created_at: "2024-09-30T18:43:06.157Z",
    updated_at: "2024-09-30T18:48:01.018Z",
    interview: { id: 4146557008, name: "Preliminary Screening Call" },
    organizer: {
        id: 4035453008,
        first_name: "Mohamed",
        last_name: "Shegow",
        name: "Mohamed Shegow",
        employee_id: null,
    },
    interviewers: [
        {
            id: 4035453008,
            employee_id: null,
            name: "Mohamed Shegow",
            email: "mohamed@sintahr.com",
            response_status: "accepted",
            scorecard_id: null,
        },
        {
            id: 4054363008,
            employee_id: null,
            name: "Mohammed Shegow",
            email: "shegowmo@gmail.com",
            response_status: "needs_action",
            scorecard_id: null,
        },
    ],
};

const interviewObjectTestCases = [
    // === Equality Checks ===
    {
        field: "id",
        inputValue: interviewObject.id,
        condition: "equals",
        value: 9019193008,
        expected: true,
    },
    {
        field: "application_id",
        inputValue: interviewObject.application_id,
        condition: "equals",
        value: 12378861008,
        expected: true,
    },
    {
        field: "status",
        inputValue: interviewObject.status,
        condition: "equals",
        value: "scheduled",
        expected: true,
    },
    {
        field: "location",
        inputValue: interviewObject.location,
        condition: "does_not_exist",
        value: null,
        expected: true,
    },
    {
        field: "interview.name",
        inputValue: interviewObject.interview.name,
        condition: "equals",
        value: "Preliminary Screening Call",
        expected: true,
    },

    // === String Contains Checks ===
    {
        field: "external_event_id",
        inputValue: interviewObject.external_event_id,
        condition: "contains",
        value: "0q62",
        expected: true,
    },
    {
        field: "video_conferencing_url",
        inputValue: interviewObject.video_conferencing_url,
        condition: "contains",
        value: "meet.google.com",
        expected: true,
    },
    {
        field: "organizer.name",
        inputValue: interviewObject.organizer.name,
        condition: "contains",
        value: "Mohamed",
        expected: true,
    },

    // === String Starts With and Ends With ===
    {
        field: "external_event_id",
        inputValue: interviewObject.external_event_id,
        condition: "starts_with",
        value: "0q62",
        expected: true,
    },
    {
        field: "video_conferencing_url",
        inputValue: interviewObject.video_conferencing_url,
        condition: "ends_with",
        value: "fkk-jfcd-rjh",
        expected: true,
    },

    // === Greater Than and Less Than for Numbers ===
    {
        field: "id",
        inputValue: interviewObject.id,
        condition: "greater_than",
        value: 8000000000,
        expected: true,
    },
    {
        field: "application_id",
        inputValue: interviewObject.application_id,
        condition: "less_than",
        value: 20000000000,
        expected: true,
    },

    // === Date Comparisons ===
    {
        field: "start.date_time",
        inputValue: interviewObject.start.date_time,
        condition: "after",
        value: "2024-10-01T00:00:00.000Z",
        expected: true,
    },
    {
        field: "end.date_time",
        inputValue: interviewObject.end.date_time,
        condition: "before",
        value: "2024-10-02T21:00:00.000Z",
        expected: true,
    },
    {
        field: "created_at",
        inputValue: interviewObject.created_at,
        condition: "before",
        value: "2024-10-01T00:00:00.000Z",
        expected: true,
    },
    {
        field: "updated_at",
        inputValue: interviewObject.updated_at,
        condition: "after",
        value: "2024-09-30T18:00:00.000Z",
        expected: true,
    },

    // === Array Property Checks ===
    {
        field: "interviewers",
        inputValue: interviewObject.interviewers,
        condition: "array_length_equals",
        value: 2,
        expected: true,
    },
    {
        field: "interviewers",
        inputValue: interviewObject.interviewers,
        condition: "array_length_greater_than",
        value: 1,
        expected: true,
    },
    {
        field: "interviewers[0].response_status",
        inputValue: interviewObject.interviewers,
        condition: "any_property_equals",
        value: "accepted",
        propertyKey: "response_status",
        expected: true,
    },
    {
        field: "interviewers",
        inputValue: interviewObject.interviewers,
        condition: "all_property_equals",
        value: "accepted",
        propertyKey: "response_status",
        expected: false, // Not all interviewers have 'accepted' status
    },
    {
        field: "interviewers",
        inputValue: interviewObject.interviewers,
        condition: "no_property_equals",
        value: "rejected",
        propertyKey: "response_status",
        expected: true,
    },

    // === Boolean Checks ===
    {
        field: "organizer.employee_id",
        inputValue: interviewObject.organizer.employee_id,
        condition: "is_false",
        value: null,
        expected: true, // employee_id is null
    },
    // === Existence Checks ===
    {
        field: "location",
        inputValue: interviewObject.location,
        condition: "does_not_exist",
        value: null,
        expected: true,
    },
    {
        field: "video_conferencing_url",
        inputValue: interviewObject.video_conferencing_url,
        condition: "exists",
        value: null,
        expected: true,
    },
];

describe("Interview Object Condition Evaluators", () => {
    interviewObjectTestCases.forEach(
        ({ field, inputValue, condition, value, expected }, index) => {
            it(`Test ${index + 1}: ${field} - ${condition}`, () => {
                const result = evaluateCondition(
                    condition,
                    value,
                    inputValue,
                    field,
                );
                expect(result).toBe(expected);
            });
        },
    );
});
