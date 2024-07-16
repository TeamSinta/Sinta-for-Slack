// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

"use client";
import { toast } from "sonner";
import { getEmailsfromSlack } from "@/server/slack/core";
import {
    filterCandidatesDataForSlack,
    matchUsers,
} from "@/lib/slack";
import { DataTable } from "@/app/(app)/_components/data-table";
import { type ColumnDef } from "@tanstack/react-table";
import React, { useEffect, useMemo, useState } from "react";
import { getColumns, type AssignmentData } from "./columns"; // Adjust to include correct imports and types for hiringrooms
import { assignmentStatusEnum } from "@/server/db/schema";
import { updateGreenhouseCandidate } from "@/server/greenhouse/core";
import { useDataTable } from "@/hooks/use-data-table";
import type {
    DataTableFilterableColumn,
    DataTableSearchableColumn,
} from "@/types/data-table";
import { type getPaginatedAssignmentsQuery, getSlackChannelsCreated } from "@/server/actions/hiringrooms/queries";
import { fetchJobsFromGreenhouse,fetchAllGreenhouseJobsFromGreenhouse,fetchGreenhouseUsers, fetchAllGreenhouseUsers, fetchCandidates} from "@/server/greenhouse/core";
import { createSlackChannel, inviteUsersToChannel, saveSlackChannelCreatedToDB} from "@/server/actions/assignments/mutations"
import { channel } from "diagnostics_channel";

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
    const [jobs, setJobs] = useState([])
    const [jobsDict, setJobsDict] = useState({})
    const [recruiters, setRecruiters] = useState([])
    const [jobNames, setJobNames] = useState([])
    const [candidatesToAssign, setCandidatesToAssign] = useState([])
    const [slackChannelsCreated, setSlackChannelsCreated] = useState([])
    const [userMapping, setUserMapping]=useState({})
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
            const slackTeamId = 'T04C82XCPRU'

            const slackUsers = await getEmailsfromSlack(slackTeamId) as any;

            // const greenhouseUsers = await fetchGreenhouseUsers() as any

            const greenhouseUsers = await fetchAllGreenhouseUsers()
            const greenhouseJobs = await fetchAllGreenhouseJobsFromGreenhouse()
            const greenhouseCandidates = await fetchCandidates()
            let coords = getAllCoordinators(greenhouseUsers, greenhouseJobs, greenhouseCandidates)
            let recrus = getAllRecruiters(greenhouseUsers, greenhouseJobs, greenhouseCandidates)
            
            console.log('greenhouseUsers- ',greenhouseUsers)
            console.log('greenhouseJobs- ',greenhouseJobs)
            console.log('greenhouseCandidates- ',greenhouseCandidates)

            // const greenhouseUsers = await fetchAllGreenhouseUsers()
            // console.log('slackUsers users - ',slackUsers)
            // console.log('greenhouse users - ',greenhouseUsers)
            let tmpUserMapping = await matchUsers(
                greenhouseUsers,
                slackUsers,
            ) as any;
            setUserMapping(tmpUserMapping)
            // console.log('tmpUserMapping users - ',tmpUserMapping)
            // console.log('userMapping users - ',userMapping)

            const slackEmails = await getEmailsfromSlack(slackTeamId)
            // console.log('slack user emails- ',slackEmails)
            // const greenhouseJobs = await fetchAllGreenhouseJobsFromGreenhouse()
            const greenhouseJobsDict = greenhouseJobs.reduce((acc, job) => {
                acc[job.id] = job;
                return acc;
            }, {});
            setJobs(greenhouseJobs)
            setJobsDict(greenhouseJobsDict)
            // let greenhouseCandidates = await fetchCandidates()
            // console.log('greenhouseJobs - ', greenhouseJobs)
            // console.log('greenhouseCandidates - ', greenhouseCandidates)
            
            const sortedCandidates = greenhouseCandidates.sort((a, b) => {
                const stageA = a.applications[0]?.current_stage?.name || "";
                const stageB = b.applications[0]?.current_stage?.name || "";
            
                return stageOrder.indexOf(stageA) - stageOrder.indexOf(stageB);
            });
            //   console.log('sortedCandidates - ', sortedCandidates)
            const modSortedCandidates = []
            sortedCandidates.forEach((cand,i)=>{
                const jobId = cand.applications[0].jobs[0].id
                const curJob = greenhouseJobsDict[jobId]
                const curJobHiringTeam = curJob.hiring_team 
                const curJobHiringManagers = curJobHiringTeam.hiring_managers
                const curJobCoordinators = curJobHiringTeam.coordinators
                const curJobSourcers = curJobHiringTeam.sourcers
                const curJobRecruiters = curJobHiringTeam.recruiters
                const combinedUsers = curJobHiringManagers.concat(curJobCoordinators).concat(curJobSourcers).concat(curJobRecruiters)
                const uniqueUsers = combinedUsers.reduce((acc, user) => {
                    if (!acc.find(item => item.id === user.id)) {
                      acc.push(user);
                    }
                    return acc;
                  }, []);
                  console.log('uniqueUsers - ',uniqueUsers)
                sortedCandidates[i].curJobHiringTeam = curJobHiringTeam
                sortedCandidates[i].curJobHiringTeamCombinedUsers = uniqueUsers
            })
            const slackChannelsCreated = await getSlackChannelsCreated()
            console.log('SLACK CHANNEL CREATED - ', slackChannelsCreated)
            let slackChannelsDict = slackChannelsCreated.reduce((acc, channel) => {
                console.log('acc - ',acc)
                console.log('channel - ',channel)
                if(!acc[channel.greenhouseCandidateId])acc[channel.greenhouseCandidateId]={}
                console.log('channel id-',channel)
                acc[channel.greenhouseCandidateId].channelName = `${channel.name}`;
                acc[channel.greenhouseCandidateId].channelLink = `https://slack.com/app_redirect?channel=${channel.channelId}`;
                // acc[channel.greenhouseCandidateId].channelLink = `https://slack.com/app_redirect?channel=${channel.channelId}`;
                return acc;
            }, {});
            setSlackChannelsCreated(slackChannelsCreated)
            console.log('slackChannelsCreated- ',slackChannelsCreated)
            console.log('slackChannelsDict- ',slackChannelsDict)
            setSlackChannelsCreatedDict(slackChannelsDict)
            
            const filteredCandidates = greenhouseCandidates.filter(candidate => {
                const applicationDate = new Date(candidate.applications[0].applied_at);
                return candidate.status === 'active' &&
                       candidate.applications[0].current_stage.name === 'Application Review' &&
                       applicationDate >= last24Hours;
            });
            // setCandidates(greenhouseCandidates)
            setCandidatesToAssign(sortedCandidates)
            // let coords = getAllCoordinators(greenhouseUsers, greenhouseJobs, greenhouseCandidates)
            // let recrus = getAllRecruiters(greenhouseUsers, greenhouseJobs, greenhouseCandidates)
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
    function getSlackUsersFromHiringTeam(curJobHiringTeam){
        const slackUsers = []
        const curJobHiringManagers = curJobHiringTeam.hiring_managers
        const curJobCoordinators = curJobHiringTeam.coordinators
        const curJobSourcers = curJobHiringTeam.sourcers
        const curJobRecruiters = curJobHiringTeam.recruiters
        
        const combinedUsers = curJobHiringManagers.concat(curJobCoordinators).concat(curJobSourcers).concat(curJobRecruiters)
        if(combinedUsers && combinedUsers.length > 0){
            combinedUsers.forEach((hm)=>{
                if(userMapping[hm.id]){
                    slackUsers.push(userMapping[hm.id])
                }
            })
        }
        return slackUsers
    }
    useEffect(()=>{
        // jobMap[jobId] = 
        let candMap = {}
        let jobMap = {}
        candidates.forEach((cand)=>{
            candMap[cand.id]={
                hiring
            }
        })
    },[])
    const createSlackChannelForCandidate = async (candidate) => {
        console.log('candidate - ',candidate)
        // create slack channel
        const slackTeamId = 'T04C82XCPRU'
        const recInitials = candidate.recruiter.first_name.substring(0,1).toLowerCase()+ candidate.recruiter.last_name.substring(0,1).toLowerCase()
        const coordInitials = candidate.coordinator.first_name.substring(0,1).toLowerCase()+ candidate.coordinator.last_name.substring(0,1).toLowerCase()
        const candName = candidate.first_name.toLowerCase() + "-"+candidate.last_name.toLowerCase()
        const channelName = `${candName+"-"+recInitials+"-"+coordInitials}`
        console.log('chanen - name ' ,channelName)
        console.log('candidate.recruiter' ,candidate.recruiter)
        console.log('candidate.recruiter' ,candidate.coordinator)
        // invite users to slack channel
        const greenhouseRecruiterId = candidate.recruiter.id
        const greenhouseCoordinatorId = candidate.coordinator.id
        const slackRecruiterId = userMapping[greenhouseRecruiterId]
        const slackCoordinatorId = userMapping[greenhouseCoordinatorId]
        const jobId = candidate.applications[0].jobs[0].id
        const curJob = jobsDict[jobId]
        const curJobHiringTeam = curJob.hiring_team

        const hiringteamSlackIds = getSlackUsersFromHiringTeam(curJobHiringTeam, userMapping)
        let slackUserIds = []
        if(slackCoordinatorId && slackCoordinatorId != "" && slackCoordinatorId != undefined){
            slackUserIds.push(slackCoordinatorId)
        }
        if(slackRecruiterId && slackRecruiterId != "" && slackRecruiterId != undefined){
            slackUserIds.push(slackRecruiterId)
        }
        // const slackUserIds = [].concat(hiringteamSlackIds)
        slackUserIds = slackUserIds.concat(slackUserIds)
        // const slackUserIds = [slackRecruiterId, slackCoordinatorId].concat(hiringteamSlackIds)
        console.log('slackUserIds - ',slackUserIds)
        // const slackIdsOfGreenHouseUsers = getSlackIdsOfGreenHouseUsers(hiringroom.recipient, candidate, userMapping)
        const slackChannelId = await createSlackChannel(channelName, slackTeamId)

        await inviteUsersToChannel(slackChannelId, slackUserIds, slackTeamId);
        // const messageText = 'Welcome to the new hiring room!';
        // await postMessageToSlackChannel(channelId, messageText);
        console.log('slackChannelId - ',slackChannelId)

        const hiringroomId = ''
        const hiringroomSlackChannelFormat = channelName
        const greenhouseJobId = candidate.applications[0].jobs[0].id
        const greenhouseCandidateId = candidate.id
            // await saveSlackChannelCreatedToDB(channelId, slackUserIds, channelName, hiringroomId, hiringroom.slackChannelFormat,"",job.id)
        await saveSlackChannelCreatedToDB(slackChannelId, slackUserIds, channelName, hiringroomId, hiringroomSlackChannelFormat, greenhouseCandidateId, greenhouseJobId)


            // try {

            //     const response = await fetch("/api/assignments", {
            //         // const response = await fetch("https://slack.com/api/conversations.create", {
            //         method: "POST",
            //         headers: {
            //             "Content-Type": "application/json",
            //             // Authorization: `Bearer ${accessToken}`,
            //         },
            //         body: JSON.stringify(hiringroomValue),
            //     });
        
            //     const data = await response.json();
            //     if (!data.ok) {
            //         throw new Error(`Error creating channel: ${data.error}`);
            //     }
            //     console.log('Channel created successfully:');
            //     return data.channel.id; // Return the channel ID for further use
            // } catch (error) {
            //     console.error('Error creating Slack channel route:', error);
            // }
        // }

    }
   
    const handleRecruiterChange = (candidateId, recruiterId) => {
        setSelectedRecruiter(prevState => ({
            ...prevState,
            [candidateId]: recruiterId,
        }));
    };    
    const handleCoordinatorChange = (candidateId, coordinatorId) => {
        setSelectedRecruiter(prevState => ({
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
        let coordinators = []
        if(users && users.length > 0){
            coordinators = users.filter(user => coordinatorSet.has(user.id));
        }
    
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
        // const recruiters = users.filter(user => recruiterSet.has(user.id));
        let recruiters = []
        if(users && users.length > 0){
            recruiters = users.filter(user => recruiterSet.has(user.id));
        }
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
                        {/* <th>Recruiter</th> */}
                        {/* <th>Coordinator</th> */}
                        <th>Job Name</th>
                        <th>Actions</th>
                        <th>Slack Users</th>
                        <th>Slack Channel</th>
                    </tr>
                </thead>
                <tbody>
                    {candidatesToAssign.map((candidate) => (
                        <tr className={"mt-2 border-2"} key={candidate.id}>
                            <td>{candidate.first_name + " " +candidate.last_name}</td>
                            <td>{candidate.applications[0].current_stage.name}</td>
                            {/* <td>{candidate.recruiter?.first_name + " " + candidate.recruiter?.last_name}</td> */}
                            {/* <td>{candidate.coordinator?.first_name + " " + candidate.coordinator?.last_name}</td> */}
                            <td>{candidate.applications[0].jobs[0].name}</td>
                            <td>
                            <div className="flex flex-row">R:<select
                                    value={selectedRecruiter[candidate.id] || candidate.recruiter}
                                    onChange={(e) => {
                                        const newRecruiterId = e.target.value;
                                        handleRecruiterChange(candidate.id, newRecruiterId);
                                        updateGreenhouseCandidate(candidate, 'recruiter', newRecruiterId);
                                    }}
                                >
                                    <option value="" disabled>Select Recruiter</option>
                                    {recruiters.map((recruiter) => (
                                        <option key={recruiter.id} value={recruiter.id}>
                                            {recruiter.name}
                                        </option>
                                    ))}
                                </select></div>
                                <div className="flex flex-row">C:<select
                                    value={selectedCoordinator[candidate.id] || candidate.coordinator}
                                    onChange={(e) => {
                                        const newCoordinatorId = e.target.value;
                                        handleCoordinatorChange(candidate.id, newCoordinatorId);
                                        updateGreenhouseCandidate(candidate, 'coordinator', newCoordinatorId);
                                    }}
                                >
                                    <option value="" disabled>Select Coordinator</option>
                                    {coordinators.map((coordinator) => (
                                        <option key={coordinator.id} value={coordinator.id}>
                                            {coordinator.name}
                                        </option>
                                    ))}
                                </select></div>
                            </td>
                            <td>
                                {/* {candidate.curJobHiringTeam.toString()} */}
                                {
                                    candidate.curJobHiringTeamCombinedUsers.map((htm,i)=>(
                                        <div key={i}><div>{htm.name}: {userMapping[htm.id]}</div></div>
                                    ))
                                }
                            </td>
                            <td>
                                {
                                slackChannelsCreatedDict[candidate.id] ? 
                                <>{slackChannelsCreatedDict[candidate.id].channelName}</> :
                                // <><a href={slackChannelsCreatedDict[candidate.id].channelLink}>Slack Channel</a></> :
                                <div onClick={()=>{createSlackChannelForCandidate(candidate)}} className="button bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Create Channel - {candidate.id}</div>
                                // <div onClick={createSlackChannelForCandidate(candidate)} className="button bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Create Channel</div>
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