import { getOrganizations } from "@/server/actions/organization/queries";
import { fetchStuckInStageWorkflows } from "@/server/actions/workflows/queries";
import { getTasks } from "@/server/mergent";
import { initializeStuckStageChecks } from "@/server/workflowTriggers/stuck-stage";
import { NextRequest, NextResponse } from "next/server";
// https://5bc1e5fa5023dc7a.ngrok.app/api/slack
const SAMPLE_UNSTUCK_APPLICATION = {
    id: 5826009008,
    candidate_id: 5646034008,
    prospect: false,
    applied_at: "2024-05-10T14:02:06.768Z",
    rejected_at: null,
    last_activity_at: "2024-07-22T13:09:53.437Z",
    location: null,
    attachments: [
        {
            filename: "a.txt",
            url: "https://grnhse-use1-prod-s8-ghr.s3.amazonaws.com/person_attachments/data/594/589/800/original/a.txt?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAVQGOLGY32JZ4XFFI%2F20240917%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20240917T200715Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=090dbc8a75d5a78bfd2db516f458ca69237c26dc777f9eb5488712998b7951b8",
            type: "resume",
            created_at: "2024-05-17T15:11:38.602Z",
        },
    ],
    source: {
        id: 4000030008,
        public_name: "HRMARKET",
    },
    credited_to: {
        id: 4035453008,
        first_name: "Mohamed",
        last_name: "Shegow",
        name: "Mohamed Shegow",
        employee_id: null,
    },
    rejection_reason: null,
    rejection_details: null,
    jobs: [
        {
            id: 4016952008,
            name: "Head of Engineering ",
        },
    ],
    job_post_id: null,
    status: "active",
    current_stage: {
        id: 4136457008,
        name: "Application Review",
    },
    answers: [],
    prospective_department: null,
    prospective_office: null,
    prospect_detail: {
        prospect_pool: null,
        prospect_stage: null,
        prospect_owner: null,
    },
};

const SAMPLE_STUCK_APPLICATION = {
    id: 5826009008,
    candidate_id: 5646034008,
    prospect: false,
    applied_at: "2024-05-10T14:02:06.768Z",
    rejected_at: null,
    last_activity_at: "2024-07-22T13:09:53.437Z",
    location: null,
    attachments: [
        {
            filename: "a.txt",
            url: "https://grnhse-use1-prod-s8-ghr.s3.amazonaws.com/person_attachments/data/594/589/800/original/a.txt?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAVQGOLGY32JZ4XFFI%2F20240917%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20240917T200715Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=090dbc8a75d5a78bfd2db516f458ca69237c26dc777f9eb5488712998b7951b8",
            type: "resume",
            created_at: "2024-05-17T15:11:38.602Z",
        },
    ],
    source: {
        id: 4000030008,
        public_name: "HRMARKET",
    },
    credited_to: {
        id: 4035453008,
        first_name: "Mohamed",
        last_name: "Shegow",
        name: "Mohamed Shegow",
        employee_id: null,
    },
    rejection_reason: null,
    rejection_details: null,
    jobs: [
        {
            id: 4016952008,
            name: "Head of Engineering ",
        },
    ],
    job_post_id: null,
    status: "active",
    current_stage: {
        id: 4150915008,
        name: "Hiring Manager Phone Screen",
    },
    answers: [],
    prospective_department: null,
    prospective_office: null,
    prospect_detail: {
        prospect_pool: null,
        prospect_stage: null,
        prospect_owner: null,
    },
};

const SAMPLE_WORKFLOW = {
    id: "24a7b1a7-742b-4285-894b-599405bb50d6",
    name: "Stuck in Pipeline",
    objectField: "Candidates",
    alertType: "stuck-in-stage",
    conditions: [
        {
            field: { label: "Offer", value: "4401518008" },
            value: "15",
            condition: "greaterThan",
        },
        { id: 0, field: "title", condition: "not_equals", value: "4" },
    ],
    triggerConfig: {
        apiUrl: "https://harvest.greenhouse.io/v1/candidates",
        processor: "4051188008",
    },
    recipient: {
        recipients: [{ value: "U07KB6J350F", label: "@Evan", source: "slack" }],
        customMessageBody: "<p>This is new workflow blah</p>",
        messageButtons: [],
        messageDelivery: "Group DM",
        messageFields: ["name", "title"],
        openingText: "Custom Opening Text",
    },
    status: "Active",
    createdAt: "2024-09-11T18:48:10.383Z",
    modifiedAt: "2024-09-11T18:48:10.383Z",
    ownerId: "007ad225-277e-43f2-8ae9-1c4a13f8717a",
    organizationId: "7020aa90-9e7c-4a74-ba36-05808550cf2e",
};
export async function POST(request: NextRequest) {
    // const body = await request.json();
    const tasks = await getTasks();
    return NextResponse.json({}, { status: 200 });
}
