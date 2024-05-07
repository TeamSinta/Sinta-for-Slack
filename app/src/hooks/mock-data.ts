import { type Scorecard, type ScorecardContainer } from "@/types/greenhouse";

// Mock data for scheduled interviews and scorecards
const mockScheduledInterviews = [
    {
        id: 9128481,
        start: {
            date_time: "2023-04-20T15:30:00.000Z",
        },
        end: {
            date_time: "2023-04-20T16:30:00.000Z",
        },
        interviewers: [
            {
                id: 4080,
                name: "Kate Austen",
                email: "kate.austen@example.com",
                scorecard_id: 11274,
            },
        ],
    },
];

const mockScorecards: ScorecardContainer = {
    "11274": {
        // The key "11274" correctly points to a Scorecard object

        id: 11274,
        updated_at: "2016-08-22T19:52:38.384Z",
        created_at: "2016-08-22T19:52:38.384Z",
        interview: "Application Review",
        interview_step: {
            id: 432,
            name: "Application Review",
        },
        candidate_id: 2131415,
        application_id: 23558552,
        interviewed_at: "2016-08-18T16:00:00.000Z",
        submitted_by: {
            id: 4080,
            first_name: "Kate",
            last_name: "Austen",
            name: "Kate Austen",
            employee_id: "12345",
        },
        interviewer: {
            id: 821,
            first_name: "Robert",
            last_name: "Robertson",
            name: "Robert Robertson",
            employee_id: "100377",
        },
        submitted_at: "2014-03-26T21:59:51Z",
        overall_recommendation: "yes",
        attributes: [
            {
                name: "Communication",
                type: "Skills",
                note: "What a great communicator!",
                rating: "yes",
            },
            {
                name: "Adaptable",
                type: "Skills",
                note: null,
                rating: "yes",
            },
            {
                name: "Relationship Manager",
                type: "Skills",
                note: null,
                rating: "mixed",
            },
            {
                name: "Project Management",
                type: "Qualifications",
                note: null,
                rating: "mixed",
            },
            {
                name: "Problem Solver",
                type: "Qualifications",
                note: null,
                rating: "no",
            },
            {
                name: "Analytical",
                type: "Skills",
                note: null,
                rating: "definitely_not",
            },
        ],
        ratings: {
            definitely_not: ["Analytical"],
            no: ["Problem Solver"],
            mixed: ["Relationship Manager", "Project Management"],
            yes: ["Communication", "Adaptable"],
            strong_yes: [],
        },
        questions: [
            {
                id: null,
                question: "Key Take-Aways (Optional)",
                answer: "Seems like a decent candidate.",
            },
            {
                id: 1234567,
                question: "Does the candidate have experience designing APIs?",
                answer: "Yes",
            },
            {
                id: 1234568,
                question: "Which team would you suggest for this candidate?",
                answer: "Alpha Team",
            },
            {
                id: 1234569,
                question: "Where would the candidate be willing to work?",
                answer: "London, Dubai, San Diego",
            },
        ],
    },
};

// Functions to simulate API calls
export async function fetchScheduledInterviews() {
    return mockScheduledInterviews;
}

export async function fetchScorecard(
    scorecardId: number | string,
): Promise<Scorecard | undefined> {
    return mockScorecards[scorecardId.toString()];
}
