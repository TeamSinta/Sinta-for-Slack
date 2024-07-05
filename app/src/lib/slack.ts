/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import type { NextRequest } from "next/server";
import crypto from "crypto";
import { env } from "@/env";
import { type Candidate } from "@/types/greenhouse";
import { type WorkflowRecipient } from "@/types/workflows";
import { getEmailsfromSlack } from "@/server/slack/core";
import { fetchGreenhouseUsers } from "@/server/greenhouse/core";

export async function log(message: string) {
    // console.log(message);
    if (!env.VERCEL_SLACK_HOOK) return;
    try {
        return await fetch(env.VERCEL_SLACK_HOOK, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                blocks: [
                    {
                        type: "section",
                        text: {
                            type: "mrkdwn",
                            text: message,
                        },
                    },
                ],
            }),
        });
    } catch (e) {
        if (e instanceof Error) {
            console.error(`Failed to log to Vercel Slack. Error: ${e.message}`);
        } else {
            console.error(`Failed to log to Vercel Slack. Error: ${String(e)}`);
        }
    }
}

export async function verifyRequest(req: NextRequest) {
    const slack_signature = req.headers.get("x-slack-signature") ?? "";
    const timestamp = req.headers.get("x-slack-request-timestamp") ?? "";

    if (!slack_signature || !timestamp) {
        return {
            status: false,
            message:
                "No slack signature or timestamp found in request headers.",
        };
    }
    if (!env.SLACK_SIGNING_SECRET) {
        return {
            status: false,
            message: "`SLACK_SIGNING_SECRET` env var is not defined.",
        };
    }
    if (Math.abs(Math.floor(Date.now() / 1000) - parseInt(timestamp)) > 300) {
        return { status: false, message: "Slack signature mismatch." };
    }

    const body = await req.text(); // Correct way to read the body as text in Next.js
    const req_body = new URLSearchParams(body).toString();
    const sig_basestring = `v0:${timestamp}:${req_body}`;
    const my_signature = `v0=${crypto.createHmac("sha256", env.SLACK_SIGNING_SECRET).update(sig_basestring).digest("hex")}`;

    if (
        slack_signature &&
        crypto.timingSafeEqual(
            Buffer.from(slack_signature),
            Buffer.from(my_signature),
        )
    ) {
        return { status: true, message: "Verified Request." };
    } else {
        return { status: false, message: "Slack signature mismatch." };
    }
}

export async function matchUsers(
    greenhouseUsers: Record<string, { id: string; email: string }>,
    slackUsers: { value: string; label: string; email: string }[],
): Promise<Record<string, string>> {

    // candidate -> application -> greenhouseUser role -> greenhouse User -> slackUser 
    const slackUserMap = slackUsers.reduce(
        (acc: Record<string, string>, user) => {
            acc[user.email] = user.value; // Map email to Slack user ID
            return acc;
        },
        {},
    );
    // console.log('slackuserMap -',slackUserMap)
    // console.log('greenhouseUsers -',greenhouseUsers)
    const userMapping: Record<string, string> = {};
    for (const greenhouseUserId in greenhouseUsers) {
        const greenhouseUser = greenhouseUsers[greenhouseUserId];
        if (greenhouseUser) {
            const email = greenhouseUser.email;
            // console.log('green house user -',greenhouseUser.)
            const slackId = slackUserMap[email];
            if (slackId) {
                console.log('email - in user matching',email)
                userMapping[greenhouseUser.id] = slackId; // Use Greenhouse user ID as the key
            }
        }
    }
    // console.log('userMapping -',userMapping)

    return userMapping;
}

export async function filterProcessedForSlack(
    candidates: Candidate[],
    workflow: WorkflowRecipient,
    slack_team_id: string,
): Promise<Record<string, {}>[]> {
    const greenhouseUsers = await fetchGreenhouseUsers();
    console.log('greenhouseruser',greenhouseUsers)
    const slackUsers = await getEmailsfromSlack(slack_team_id);
    console.log('slackUsers',slackUsers)
    const userMapping = await matchUsers(greenhouseUsers, slackUsers);
    // console.log("workflow", workflow);
    // console.log("slackUsers", slackUsers);
    // recipients, greenhouse recipients from greenhouse candidate application, greenhouse users, slack users
    
    // const recipientsx = workflow.recipients
    // recipientsx.forEach((recipientx: any)=>{
    //     if(recipientx.source == "greenhouse"){
    //     //find the user
    //         console.log('go bucks')
    //         // value == coordinator
    //         const role = recipientx.value
    //         if(role.contains("ecruiter")){
    //             const application = 
    //         } else if(role.contains("oordinator")){
                
    //         }
    //         else{
    //             console.log('no role greenhouse')
    //         }
    //     }
    // })
    
    return candidates.map((candidate) => {
        const result: Record<string, {}> = {
            candidate_id: candidate.id, // Include candidate ID
            coordinator: candidate.coordinator,
            recruiter: candidate.recruiter
        };
        // to clarify the "first application" of a candidate, cutting corner because 99%? only have one
        // const cand_app = candidate.applications[0]

        // why are we using message fields for this?
        workflow.recipients.forEach((recipient)=>{
            //find the user
            // console.log('recipient - ',recipient.source)
            // console.log('recipient - ',recipient.value)
            // value == coordinator
            if(recipient.source == "greenhouse"){
                const role = recipient.value
            if(role.includes("ecruiter")){
                console.log('found role recruiter- ',candidate.recruiter.id)
                const slackId = userMapping[candidate.recruiter.id];
                // result[field] = slackId
                //         ? `<@${slackId}>`
                //         : candidate.recruiter.name;
                // } else {
                    // result[field] = "No recruiter";
                // }
                const recruiter = candidate.recruiter
                if(userMapping[candidate.recruiter.id]){
                    console.log('entered map')
                    recipient.slackValue = userMapping[candidate.recruiter.id]
                }
                else{
                    console.log('else map', candidate.recruiter.first_name)

                    recipient.slackValue =" no bucks"
                }
                
            } else if(role.includes("oordinator")){
                console.log('found role - ',candidate.coordinator.id)
                if(userMapping[candidate.coordinator.id]){
                    console.log('entered map')
                    recipient.slackValue = userMapping[candidate.coordinator.id]
                }
                else{
                    console.log('else map', candidate.coordinator.first_name)
                    recipient.slackValue =" no bucks coordinator"

                }
                
                
            }
            else{
                // console.log('no role greenhouse')
            }
        }
        })
        workflow.messageFields.forEach((field) => {
            switch (field) {
                case "name":
                    result[field] =
                        `${candidate.first_name} ${candidate.last_name}`;
                    break;
                case "title":
                    result[field] = candidate.title || "Not provided";
                    break;
                // case "recruiter_name":
                //     console.log('recuirter found')
                //     if (candidate.recruiter) {
                //         const slackId = userMapping[candidate.recruiter.id];
                //         result[field] = slackId
                //             ? `<@${slackId}>`
                //             : candidate.recruiter.name;
                //     } else {
                //         result[field] = "No recruiter";
                //     }
                //     break;
                // case "coordinator_name":
                    // console.log('coordinator_name found')
                    // if (candidate.coordinator) {
                    //     const slackId = userMapping[candidate.coordinator.id];
                    //     result[field] = slackId
                    //         ? `<@${slackId}>`
                    //         : candidate.coordinator.name;
                    // } else {
                    //     result[field] = "No coordinator";
                    // }
                    // break;
                default:
                    const candidateField = candidate[field as keyof Candidate];
                    result[field] = getFieldValue(candidateField, field);
                    break;
            }
        });
        console.log('user mapping  -' ,userMapping)
        return result;
    });
}

function getFieldValue(field: unknown, fieldName: string): string {
    if (field === undefined || field === null) {
        return "Not available";
    }
    if (typeof field === "object") {
        return `[Object: ${fieldName}]`; // Provide a better description for objects
    }
    return String(field);
}
