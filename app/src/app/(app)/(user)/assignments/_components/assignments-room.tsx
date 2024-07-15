// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

"use client";

import { DataTable } from "@/app/(app)/_components/data-table";
import { type ColumnDef } from "@tanstack/react-table";
import React, { useEffect, useMemo, useState } from "react";
import { getColumns, type AssignmentData } from "./columns"; // Adjust to include correct imports and types for hiringrooms
import { assignmentStatusEnum } from "@/server/db/schema";
import { useDataTable } from "@/hooks/use-data-table";
import type {
    DataTableFilterableColumn,
    DataTableSearchableColumn,
} from "@/types/data-table";
import { type getPaginatedAssignmentsQuery, getSlackChannelsCreated } from "@/server/actions/hiringrooms/queries";
import { fetchJobsFromGreenhouse,fetchAllGreenhouseJobsFromGreenhouse, fetchAllGreenhouseUsers, fetchCandidates} from "@/server/greenhouse/core";

const filterableColumns: DataTableFilterableColumn<AssignmentData>[] = [
    {
        id: "status",
        title: "Status",
        options: assignmentStatusEnum.enumValues.map((v) => ({
            label: v,
            value: v,
        })),
    },
];

type AssignmentsTableProps = {
    assignmentsPromise: ReturnType<typeof getPaginatedAssignmentsQuery>;
};

const searchableColumns: DataTableSearchableColumn<AssignmentData>[] = [
    { id: "name", placeholder: "Search by hiringroom name..." },
];

export function AssignmentsRoom() {
    // export function AssignmentsRoom({ hiringroomsPromise }: AssignmentsTableProps) {
    // const { data, pageCount, total } = React.use(hiringroomsPromise);

    // const columns = useMemo<ColumnDef<AssignmentData, unknown>[]>(
    //     () => getColumns(),
    //     [],
    // );
    const [slackChannelsCreatedDict, setSlackChannelsCreatedDict] = useState({})
    const [candidates, setCandidates] = useState([])
    const [coordinators, setCoordinators] = useState([])
    const [recruiters, setRecruiters] = useState([])
    const [jobNames, setJobNames] = useState([])
    const [candidatesToAssign, setCandidatesToAssign] = useState([])
    const [slackChannelsCreated, setSlackChannelsCreated] = useState([])

    const [selectedRecruiter, setSelectedRecruiter] = useState({});
    const [selectedCoordinator, setSelectedCoordinator] = useState({});

    useEffect(() => {
        const fetchData = async () => {
            // const stageOrder = {
            //     "Application Review":0,
            //     "Preliminary Phone Screen":1,
            //     "Phone Interview":2,
            //     "Face to Face":3,
            //     "Reference Check":4,
            //     "Offer":5,
            // };
            const stageOrder = [
                "Application Review",
                "Preliminary Phone Screen",
                "Phone Interview",
                "Face to Face",
                "Reference Check",
                "Offer"
              ];
              
            const greenhouseUsers = await fetchAllGreenhouseUsers()
            const greenhouseJobs = await fetchAllGreenhouseJobsFromGreenhouse()
            let greenhouseCandidates = await fetchCandidates()
            console.log('greenhouseCandidates - ', greenhouseCandidates)
            
            const sortedCandidates = greenhouseCandidates.sort((a, b) => {
                const stageA = a.applications[0]?.current_stage?.name || "";
                const stageB = b.applications[0]?.current_stage?.name || "";
            
                return stageOrder.indexOf(stageA) - stageOrder.indexOf(stageB);
            });
              console.log('sortedCandidates - ', sortedCandidates)

            const slackChannelsCreated = await getSlackChannelsCreated()
            console.log('SLACK CHANNEL CREATED - ', slackChannelsCreated)
            let slackChannelsDict = slackChannelsCreated.reduce((acc, channel) => {
                acc[channel.candidate_id] = `https://slack.com/app_redirect?channel=${channel.channelId}`;
                return acc;
            }, {});
            setSlackChannelsCreated(slackChannelsCreated)
            setSlackChannelsCreatedDict(slackChannelsDict)
            
            const filteredCandidates = greenhouseCandidates.filter(candidate => {
                const applicationDate = new Date(candidate.applications[0].applied_at);
                return candidate.status === 'active' &&
                       candidate.applications[0].current_stage.name === 'Application Review' &&
                       applicationDate >= last24Hours;
            });
            // setCandidates(greenhouseCandidates)
            setCandidatesToAssign(sortedCandidates)
            let coords = getAllCoordinators(greenhouseUsers, greenhouseJobs, greenhouseCandidates)
            let recrus = getAllRecruiters(greenhouseUsers, greenhouseJobs, greenhouseCandidates)
            console.log('coords - ',coords)
            console.log('recrus - ',recrus)
            setCoordinators(coords)
            setRecruiters(recrus)
            setJobNames(greenhouseJobs)
        }
        fetchData()
    }, []);

    useEffect(() => {
        const getCandidates = async () => {
            const data = await fetchCandidates();
            console.log('data',data)
            setCandidates([]);
            // setCandidates(data);
        };

        getCandidates();
    }, []);

    const handleRecruiterChange = (candidateId, recruiterId) => {
        setSelectedRecruiter((prevState) => ({
            ...prevState,
            [candidateId]: recruiterId,
        }));
    };

    const handleCoordinatorChange = (candidateId, coordinatorId) => {
        setSelectedCoordinator((prevState) => ({
            ...prevState,
            [candidateId]: coordinatorId,
        }));
    };

    function getAllCoordinators(users: GreenhouseUser[], jobs: GreenhouseJob[], candidates: GreenhouseCandidate[]) {
        // Get all coordinators from jobs
        const coordinatorSet = new Set<string>();
        jobs.forEach(job => {
            if (job.coordinator_ids) {
                job.coordinator_ids.forEach(id => coordinatorSet.add(id));
            }
        });
    
        // Get all coordinators from candidates
        candidates.forEach(candidate => {
            if (candidate.coordinator) {
                coordinatorSet.add(candidate.coordinator.id);
            }
        });
    
        // Create list of coordinators
        const coordinators = users.filter(user => coordinatorSet.has(user.id));
    
        return coordinators;
    }
    function getAllRecruiters(users: GreenhouseUser[], jobs: GreenhouseJob[], candidates: GreenhouseCandidate[]) {
        // Get all coordinators from jobs
        const recruiterSet = new Set<string>();
        jobs.forEach(job => {
            if (job.recruiter_ids) {
                job.recruiter_ids.forEach(id => recruiterSet.add(id));
            }
        });
    
        // Get all coordinators from candidates
        candidates.forEach(candidate => {
            if (candidate.recruiter) {
                recruiterSet.add(candidate.recruiter.id);
            }
        });
    
        // Create list of coordinators
        const recruiters = users.filter(user => recruiterSet.has(user.id));
    
        return recruiters;
    }
    return (
        <div>
            <h1>Candidates List</h1>
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Stage</th>
                        <th>Recruiter</th>
                        <th>Coordinator</th>
                        <th>Job Name</th>
                        <th>Actions</th>
                        <th>Slack Channel</th>
                    </tr>
                </thead>
                <tbody>
                    {candidatesToAssign.map((candidate) => (
                        <tr key={candidate.id}>
                            <td>{candidate.first_name + " " +candidate.last_name}</td>
                            <td>{candidate.applications[0].current_stage.name}</td>
                            <td>{candidate.recruiter?.first_name + " " + candidate.recruiter?.last_name}</td>
                            <td>{candidate.coordinator?.first_name + " " + candidate.coordinator?.last_name}</td>
                            <td>{candidate.applications[0].jobs[0].name}</td>
                            <td>
                            <div className="flex flex-row">R:<select
                                    value={selectedRecruiter[candidate.id] || candidate.recruiter || ""}
                                    onChange={(e) => handleRecruiterChange(candidate.id, e.target.value)}
                                >
                                    <option value="" disabled></option>
                                    {/* <option value="" disabled>Select Recruiter</option> */}
                                    {recruiters.map((recruiter) => (
                                        <option key={recruiter.id} value={recruiter.name}>
                                            {recruiter.name}
                                        </option>
                                    ))}
                                </select></div>
                                <div className="flex flex-row">C:<select
                                value={selectedCoordinator[candidate.id] || candidate.coordinator || ""}
                                    // value={selectedCoordinator[candidate.id] || candidate.coordinator}
                                    onChange={(e) => handleCoordinatorChange(candidate.id, e.target.value)}
                                >
                                    <option value="" disabled></option>
                                    {/* <option value="" disabled>Select Coordinator</option> */}
                                    {coordinators.map((coordinator) => (
                                        <option key={coordinator.id} value={coordinator.name}>
                                            {coordinator.name}
                                        </option>
                                    ))}
                                </select></div>
                            </td>
                            <td>
                                {
                                slackChannelsCreatedDict[candidate.id] ? 
                                <>{slackChannelsCreatedDict[candidate.id].channelLink}</> :
                                 <div className="button">Create Channel</div>
                                 }
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Stage</th>
                        {/* <th>Recruiter</th> */}
                        {/* <th>Coordinator</th> */}
                        <th>Job Name</th>
                        <th>Actions</th>
                        <th>Slack Channel</th>

                    </tr>
                </thead>
                <tbody>
                    {candidates.map((candidate) => (
                        <tr key={candidate.id}>
                            <td>{candidate.first_name + " " +candidate.last_name}</td>
                            <td>{candidate.applications[0].current_stage.name}</td>
                            {/* <td>{candidate.recruiter?.first_name + " " + candidate.recruiter?.last_name}</td> */}
                            {/* <td>{candidate.coordinator?.first_name + " " + candidate.coordinator?.last_name}</td> */}
                            <td>{candidate.applications[0].jobs[0].name}</td>
                            <td>
                            <div className="flex flex-row">R:<select
                                    value={selectedRecruiter[candidate.id] || candidate.recruiter || ""}
                                    onChange={(e) => handleRecruiterChange(candidate.id, e.target.value)}
                                >
                                    <option value="" disabled></option>
                                    {/* <option value="" disabled>Select Recruiter</option> */}
                                    {recruiters.map((recruiter) => (
                                        <option key={recruiter.id} value={recruiter.name}>
                                            {recruiter.name}
                                        </option>
                                    ))}
                                </select></div>
                                <div className="flex flex-row">C:<select
                                value={selectedCoordinator[candidate.id] || candidate.coordinator || ""}
                                    // value={selectedCoordinator[candidate.id] || candidate.coordinator}
                                    onChange={(e) => handleCoordinatorChange(candidate.id, e.target.value)}
                                >
                                    <option value="" disabled></option>
                                    {/* <option value="" disabled>Select Coordinator</option> */}
                                    {coordinators.map((coordinator) => (
                                        <option key={coordinator.id} value={coordinator.name}>
                                            {coordinator.name}
                                        </option>
                                    ))}
                                </select></div>
                            </td>

                            <td>
                                {
                                slackChannelsCreatedDict[candidate.id] ? 
                                <>{slackChannelsCreatedDict[candidate.id].channelLink}</> :
                                 <div className="button">Create Channel</div>
                                 }
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const handleAction1 = (id) => {
    alert(`Button 1 clicked for candidate ${id}`);
};

const handleAction2 = (id) => {
    alert(`Button 2 clicked for candidate ${id}`);
};

const handleAction3 = (id) => {
    alert(`Button 3 clicked for candidate ${id}`);
};

export default AssignmentsRoom;