// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

"use client";
import { getEmailsfromSlack,getChannels } from "@/server/slack/core";

import { AssignmentsChannelTable } from "../_components/assignmentchannels-table";
import {
    matchUsers,
} from "@/lib/slack";

import React, { useEffect, useState } from "react";
// Adjust to include correct imports and types for hiringrooms
import { updateGreenhouseCandidate } from "@/server/greenhouse/core";

import { getSlackChannelsCreated } from "@/server/actions/hiringrooms/queries";
import {fetchAllGreenhouseJobsFromGreenhouse,fetchGreenhouseUsers, fetchAllGreenhouseUsers, fetchCandidates} from "@/server/greenhouse/core";
import { createSlackChannel, inviteUsersToChannel, saveSlackChannelCreatedToDB} from "@/server/actions/assignments/mutations"

export function AssignmentsRoom({assignmentsPromise}: any) {
    // export function AssignmentsRoom({ searchParams }: UsersPageProps) {
    // export function AssignmentsRoom({ hiringroomsPromise }: AssignmentsTableProps) {
    // const { data, pageCount, total } = React.use(hiringroomsPromise);

    // const columns = useMemo<ColumnDef<AssignmentData, unknown>[]>(
    //     () => getColumns(),
    //     [],
    // );

    // const assignmentsPromise = getSlackChannelsCreated()
    // const hiringroomAllPromise = getPaginatedHiringroomsByOrgQuery(search);

    const [recruiterCounts, setRecruiterCounts] = useState({});
    const [coordinatorCounts, setCoordinatorCounts] = useState({});
    const [slackChannelsCreatedDict, setSlackChannelsCreatedDict] = useState({})
    const [candidates, setCandidates] = useState([])
    const [coordinators, setCoordinators] = useState([])
    const [jobs, setJobs] = useState([])
    const [jobsDict, setJobsDict] = useState({})
    const [candidateDict, setCandidateDict] = useState({})
    const [recruiters, setRecruiters] = useState([])
    const [jobNames, setJobNames] = useState([])
    const [candidatesToAssign, setCandidatesToAssign] = useState([])
    const [slackChannelsCreated, setSlackChannelsCreated] = useState([])
    const [userMapping, setUserMapping]=useState({})
    const [selectedRecruiter, setSelectedRecruiter] = useState({});
    const [selectedCoordinator, setSelectedCoordinator] = useState({});
    const [showCounts, setShowCounts] = useState(false);
    const [allSlackChannels, setAllSlackChannels] = useState([])

    useEffect(()=>{
        const getAllSlackChannels = async()=>{
            const slackResp = await getChannels()
            console.log('slack resp - ',slackResp)
            setAllSlackChannels(slackResp)
        }
        getAllSlackChannels()
    },[])
    const toggleCounts = () => {
      setShowCounts(!showCounts);
    };
    const getRecruiterCounts = (candidates) => {
        const counts = {};
        candidates.forEach(candidate => {
            const recruiterId = candidate.recruiter?.id;
            if (recruiterId) {
                if (!counts[recruiterId]) {
                    counts[recruiterId] = { count: 0, name: candidate.recruiter.name };
                }
                counts[recruiterId].count++;
            }
        });
        return counts;
    };

    const getCoordinatorCounts = (candidates) => {
        const counts = {};
        candidates.forEach(candidate => {
            const coordinatorId = candidate.coordinator?.id;
            if (coordinatorId) {
                if (!counts[coordinatorId]) {
                    counts[coordinatorId] = { count: 0, name: candidate.coordinator.name };
                }
                counts[coordinatorId].count++;
            }
        });
        return counts;
    };
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
            const greenhouseUsersDict = await fetchGreenhouseUsers()
            const greenhouseJobs = await fetchAllGreenhouseJobsFromGreenhouse()
            const greenhouseCandidates = await fetchCandidates()
            setCandidates(greenhouseCandidates)
            const coords = getAllCoordinators(greenhouseUsers, greenhouseJobs, greenhouseCandidates)
            const recrus = getAllRecruiters(greenhouseUsers, greenhouseJobs, greenhouseCandidates)
            const initialRecruiterCounts = getRecruiterCounts(greenhouseCandidates);
            const initialCoordinatorCounts = getCoordinatorCounts(greenhouseCandidates);
            
            setRecruiterCounts(initialRecruiterCounts);
            setCoordinatorCounts(initialCoordinatorCounts);
            console.log('greenhouseUsersgreenhouseUsers- ',greenhouseUsers)
            console.log('slackUsers- ',slackUsers)
            console.log('greenhouseJobs- ',greenhouseJobs)
            console.log('greenhouseUsersDict- ',greenhouseUsersDict)
            console.log('greenhouseCandidates- ',greenhouseCandidates)

            // const greenhouseUsers = await fetchAllGreenhouseUsers()
            // console.log('slackUsers users - ',slackUsers)
            // console.log('greenhouse users - ',greenhouseUsers)
            const tmpUserMapping = await matchUsers(
                greenhouseUsersDict,
                slackUsers,
            ) as any;
            console.log('tmpUserMapping users - ',tmpUserMapping)
            setUserMapping(tmpUserMapping)
            // console.log('userMapping users - ',userMapping)

            const slackEmails = await getEmailsfromSlack(slackTeamId)
            // console.log('slack user emails- ',slackEmails)
            // const greenhouseJobs = await fetchAllGreenhouseJobsFromGreenhouse()
            const greenhouseJobsDict = greenhouseJobs.reduce((acc, job) => {
                acc[job.id] = job;
                return acc;
            }, {});
            const greenhouseCandidateDict = greenhouseCandidates.reduce((acc, cand) => {
                acc[cand.id] = cand;
                return acc;
            }, {});
            setJobs(greenhouseJobs)
            setJobsDict(greenhouseJobsDict)
            setCandidateDict(greenhouseCandidateDict)
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
                const jobId = cand.applications[0].jobs[0].id;
                const curJob = greenhouseJobsDict[jobId];
                const curJobHiringTeam = curJob.hiring_team;
                const curJobHiringManagers = curJobHiringTeam.hiring_managers.map(user => ({ ...user, role: 'Hiring Manager' }));
                const curJobCoordinators = curJobHiringTeam.coordinators.map(user => ({ ...user, role: 'Coordinator' }));
                const curJobSourcers = curJobHiringTeam.sourcers.map(user => ({ ...user, role: 'Sourcer' }));
                const curJobRecruiters = curJobHiringTeam.recruiters.map(user => ({ ...user, role: 'Recruiter' }));
            
                const combinedUsers = [...curJobHiringManagers, ...curJobCoordinators, ...curJobSourcers, ...curJobRecruiters];
            
                const uniqueUsers = combinedUsers.reduce((acc, user) => {
                    if (!acc.find(item => item.id === user.id)) {
                        acc.push(user);
                    }
                    return acc;
                }, []);
                sortedCandidates[i].curJobHiringTeam = curJobHiringTeam
                sortedCandidates[i].curJobHiringTeamCombinedUsers = uniqueUsers
            })
            const slackChannelsCreated = await getSlackChannelsCreated()
            const slackChannelsDict = slackChannelsCreated.reduce((acc, channel) => {
                if(channel.isArchived){
                    return acc
                }
                else{
                    if(!acc[channel.greenhouseCandidateId])acc[channel.greenhouseCandidateId]={}
                    acc[channel.greenhouseCandidateId].channelId = channel.channelId
                    acc[channel.greenhouseCandidateId].channelName = `${channel.name}`;
                    acc[channel.greenhouseCandidateId].channelLink = `https://slack.com/app_redirect?channel=${channel.channelId}`;
                    // acc[channel.greenhouseCandidateId].channelLink = `https://slack.com/app_redirect?channel=${channel.channelId}`;
                    
                }
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
            // let coords = getAllCoordinators(greenhouseUsers, greenhouseJobs, greenhouseCandidates)
            // let recrus = getAllRecruiters(greenhouseUsers, greenhouseJobs, greenhouseCandidates)
            setCoordinators(coords)
            setRecruiters(recrus)
            setJobNames(greenhouseJobs)
        }
        fetchData()
    }, []);

    // useEffect(() => {
    //     const getCandidates = async () => {
    //         const data = await fetchCandidates();
    //         console.log('data',data)
    //         // setCandidates([]);
    //         setCandidates(data);
    //     };

    //     getCandidates();
    // }, []);
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
        const candMap = {}
        const jobMap = {}
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
        const recInitials = candidate.recruiter ? candidate.recruiter.first_name.substring(0,1).toLowerCase()+ candidate.recruiter.last_name.substring(0,1).toLowerCase() : ""
        const coordInitials = candidate.coordinator ? candidate.coordinator.first_name.substring(0,1).toLowerCase()+ candidate.coordinator.last_name.substring(0,1).toLowerCase() : ""
        const candName = candidate.first_name.toLowerCase() + "-"+candidate.last_name.toLowerCase()
        const channelName = `${candName+"-"+recInitials+"-"+coordInitials}`

        // invite users to slack channel
        const greenhouseRecruiterId = candidate?.recruiter?.id
        const greenhouseCoordinatorId = candidate?.coordinator?.id
        const slackRecruiterId = userMapping[greenhouseRecruiterId]
        const slackCoordinatorId = userMapping[greenhouseCoordinatorId]
        const jobId = candidate.applications[0].jobs[0].id
        const curJob = jobsDict[jobId]
        const curJobHiringTeam = curJob.hiring_team
        console.log('greenhouseRecruiterId - ',greenhouseRecruiterId)
        console.log('greenhouseCoordinatorId - ',greenhouseCoordinatorId)
        console.log('slackCoordinatorId - ',slackCoordinatorId)
        console.log('slackRecruiterId - ',slackRecruiterId)
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
        console.log('slackChannelId - ',slackChannelId)
        if(slackChannelId){
            await inviteUsersToChannel(slackChannelId, slackUserIds, slackTeamId);
            const hiringroomId = ''
            const hiringroomSlackChannelFormat = channelName
            const greenhouseJobId = candidate?.applications[0]?.jobs[0].id
            const greenhouseCandidateId = candidate.id
                // await saveSlackChannelCreatedToDB(channelId, slackUserIds, channelName, hiringroomId, hiringroom.slackChannelFormat,"",job.id)
            console.log('pre slack channel db -')
            const slackChannelDB = await saveSlackChannelCreatedToDB(slackChannelId, slackUserIds, channelName, hiringroomId, hiringroomSlackChannelFormat, greenhouseCandidateId, greenhouseJobId)
            console.log('post slack channel db -',slackChannelDB)
            // update ui
            const tmpSlackChannelsCreatedDict = slackChannelsCreatedDict
            tmpSlackChannelsCreatedDict[candidate.id] = slackChannelDB
            setCandidateDict(tmpSlackChannelsCreatedDict)
        }
        else{
            console.log('failed to create channel')
        }
    }
   
    const handleRecruiterChange = (candidateId, newRecruiterId) => {
        console.log('candidaters - ',candidates)
        console.log('recruiters - ',recruiters)
        console.log('newRecruiterId - ',newRecruiterId)

        const updatedCandidates = candidates.map(candidate => {
            if (candidate.id === candidateId) {
                candidate.recruiter = recruiters.find(r => r.id === newRecruiterId);
            }
            return candidate;
        });
        setSelectedRecruiter(prevState => ({
            ...prevState,
            [candidateId]: newRecruiterId,
        }));
        console.log('updatedCandidates',updatedCandidates)
        setRecruiterCounts(getRecruiterCounts(updatedCandidates));
    };    
    const handleCoordinatorChange = (candidateId, newCoordinatorId) => {
        console.log('candidaters - ',candidates)
        console.log('coordinators - ',coordinators)
        console.log('newCoordinatorId - ',newCoordinatorId)
        const updatedCandidates = candidates.map(candidate => {
            if (candidate.id === candidateId) {
                candidate.coordinator = coordinators.find(c => c.id === newCoordinatorId);
            }
            return candidate;
        });
        setSelectedCoordinator(prevState => ({
            ...prevState,
            [candidateId]: newCoordinatorId,
        }));
        setCoordinatorCounts(getCoordinatorCounts(updatedCandidates));
        console.log('updatedCandidates',updatedCandidates)

    };
    async function handleDeleteSlackChannel(channel){
        try{
            const channelId = channel.id
            const slackTeamId = 'T04C82XCPRU'
            // const deleteResponse = await deleteConversation(channelId)
            const deleteObj = {hasDelete:true, hasArchive:false, channelId:channelId, slackTeamId: slackTeamId}
            const response = await fetch("/api/slack", {
                // const response = await fetch("https://slack.com/api/conversations.create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    // Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify(deleteObj),
            });
            console.log('deleteResponse - ',response)
            return response
        }
        catch(e){
            console.log('eee-',e)
        }
    }
    async function handleArchiveSlackChannel(candidate){
        try{
            const channelId = slackChannelsCreatedDict[candidate.id].channelId
            const slackTeamId = 'T04C82XCPRU'
            // const deleteResponse = await deleteConversation(channelId)
            const deleteObj = {hasArchive: true, hasDelete:false, channelId:channelId, slackTeamId: slackTeamId}
            const response = await fetch("/api/slack", {
                // const response = await fetch("https://slack.com/api/conversations.create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    // Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify(deleteObj),
            });
            console.log('deleteResponse - ',response)
            return
        }
        catch(e){
            console.log('eee-',e)
        }
    }
    async function deleteChannel(channel){
        console.log('delete channel -',channel)
        const response = await handleDeleteSlackChannel(channel)
        // update ui
        // do something 
        const tmpAllSlackChannels = allSlackChannels
        console.log('tmpAllSlackChannels -',tmpAllSlackChannels)
        // const updatedChannels = tmpAllSlackChannels.filter(c => c.id !== channel.id);
        const updatedChannels = tmpAllSlackChannels.map((chan)=>{
            if(channel.id == chan.id){
                console.log('FOUND - UNDOING THE ARCHIVE STATUS - ',chan)
                console.log('FOUND - UNDOING THE ARCHIVE STATUS - ',chan.is_archived)
                chan.is_archived = !chan.is_archived
            }
            return chan
        });
        console.log('updated -',updatedChannels)
        setAllSlackChannels(updatedChannels)
        console.log('resposne - ',response)
    }
    async function archiveConversation(channelId) {
        const response = await fetch('https://slack.com/api/conversations.archive', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.SLACK_BOT_TOKEN}`
            },
            body: JSON.stringify({
                channel: channelId
            })
        });
    
        const data = await response.json();
        if (!data.ok) {
            throw new Error(data.error);
        }
    
        return data;
    }

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
        <div className="overflow-x-auto">
            <div className="flex flex-col">
                {/* <AssignmentsSettings></AssignmentsSettings> */}
                <div className="flex flex-col">
                {/* <div className="flex justify-between items-center"> */}
                    {/* <h1 className="text-2xl font-bold">Assignments</h1> */}
                    <button
                    className="w-fit bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded"
                    onClick={toggleCounts}
                    >
                    {showCounts ? 'Hide Counts Recruiter / Coordinator Candidate Count' : 'Show Recruiter / Coordinator Candidate Count'}
                    </button>
                </div>
      {/* <p className="text-sm text-gray-500">Overview of your account usage and potential features</p> */}

      {showCounts && (
        <div className="flex-col my-4">
          {/* <h2 className="text-lg font-bold">Counts</h2> */}
          <div className="flex">
            <div className="pr-5">
              <h3 className="font-semibold">Recruiter Counts</h3>
              <p>Chris Wu: 3</p>
              <p>Mohamed Shegow: 1</p>
              <p>Matthew Konicke: 1</p>
            </div>
            <div  className="pr-5">
              <h3 className="font-semibold">Coordinator Counts</h3>
              <p>Chris Wu: 1</p>
              <p>Matthew Konicke: 3</p>
              <p>Mohammed Shegow: 2</p>
            </div>
          </div>
        </div>
      )}

            {/* <div className="flex flex-col pl-8"><h2>Recruiter Counts</h2>
            <ul>
                {Object.entries(recruiterCounts).map(([id, { count, name }]) => (
                    <li key={id}>{name}: {count}</li>
                ))}
            </ul></div>
            <div className="flex flex-col pl-8"><h2>Coordinator Counts</h2>
            <ul>
                {Object.entries(coordinatorCounts).map(([id, { count, name }]) => (
                    <li key={id}>{name}: {count}</li>
                ))}
            </ul></div> */}
                
            </div>
            {/* <h1>Candidates List</h1> */}
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-700">
                    <tr>
                        <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Name
                        </th>
                        <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Stage
                        </th>
                        <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Job Name
                        </th>
                        <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Actions
                        </th>
                        <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Job Hiring Team
                        </th>
                        <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Slack Channel
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800">
                    {candidatesToAssign.map((candidate) => (
                        <tr className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700" key={candidate.id}>
                            <td className="px-3 py-1 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                                {/* {candidate.first_name + " " + candidate.last_name} */}
                                {candidate ? (candidate.first_name[0] + candidate.last_name[0]).toUpperCase() : ""}

                            </td>
                            <td className="px-3 py-1 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                                {candidate.applications[0].current_stage.name}
                            </td>
                            <td className="px-3 py-1 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                                {candidate.applications[0].jobs[0].name}
                            </td>
                            <td className="px-3 py-1 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                                <div className="flex flex-col space-y-2">
                                    <div className="flex items-center">
                                        <span className="mr-2">Rec:</span>
                                        <select
                                            value={selectedRecruiter[candidate.id] || candidate.recruiter?.id || ""}
                                            onChange={(e) => {
                                                const newRecruiterId = e.target.value;
                                                handleRecruiterChange(candidate.id, newRecruiterId);
                                                updateGreenhouseCandidate(candidate, 'recruiter', newRecruiterId);
                                            }}
                                            className="w-100 form-select min-w-40 px-2 py-1 rounded-md border border-gray-300 dark:border-gray-600"
                                        >
                                            <option value="" disabled>Select Recruiter</option>
                                            {recruiters.map((recruiter) => (
                                                <option key={recruiter.id} value={recruiter.id}>
                                                    {recruiter.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="flex items-center">
                                        <span className="mr-2">Coord:</span>
                                        <select
                                            value={selectedCoordinator[candidate.id] || candidate.coordinator?.id || ""}
                                            onChange={(e) => {
                                                const newCoordinatorId = e.target.value;
                                                handleCoordinatorChange(candidate.id, newCoordinatorId);
                                                updateGreenhouseCandidate(candidate, 'coordinator', newCoordinatorId);
                                            }}
                                            className="w-100 form-select min-w-40 px-2 py-1 rounded-md border border-gray-300 dark:border-gray-600"
                                        >
                                            <option value="" disabled>Select Coordinator</option>
                                            {coordinators.map((coordinator) => (
                                                <option key={coordinator.id} value={coordinator.id}>
                                                    {coordinator.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </td>
                            <td className={"px-3 py-1 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100 "}>
                                {candidate.curJobHiringTeamCombinedUsers.map((htm, i) => (
                                    <div key={i} >
                                        <div>
                                            <div className={"flex flex-row"+userMapping[htm.id]?"bg-green-200":"bg-red-200"}>
                                                {htm.role}: {htm.name}
                                                {/* <div className={userMapping[htm.id]?"bg-green-200":"bg-red-200"}>
                                                    <Icons.slack
                                                        className="h-5 w-5"
                                                    />
                                                </div> */}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </td>
                            <td className="px-3 py-1 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                                {slackChannelsCreatedDict[candidate.id] ? (
                                    <div
                                        onClick={() => { handleArchiveSlackChannel(candidate) }}
                                        className="w-fit button bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                                    >
                                        Delete - {slackChannelsCreatedDict[candidate.id].channelName}
                                    </div>
                                ) : (
                                    <div
                                        onClick={() => { createSlackChannelForCandidate(candidate) }}
                                        className="w-fit button bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                                    >
                                        Create Channel
                                    </div>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>




            {/* <AssignmentsTable assignmentsPromise={assignmentsPromise} /> */}

            {/* <SlackChannelsCreatedTable slackChannelsCreatedPromise={assignmentsPromise}></SlackChannelsCreatedTable> */}
                    {Object.keys(candidateDict).length > 0 ?
                    <AssignmentsChannelTable slackChannelsCreatedPromise={assignmentsPromise} greenhouseCandidateDict={candidateDict} greenhouseJobsDict={jobsDict}></AssignmentsChannelTable>
                    :
                    <>
                    LOADING...
                    </>}
            {allSlackChannels && allSlackChannels.length > 0 ? 
            <>
            bucks
            {allSlackChannels.map((channel,i) => (
                <div key={i} className="flex flex-row">
                    <div className="flex flex-row">{channel?.name}</div>
                    <div className="flex flex-row">
                        {!channel?.is_archived ? <>
                        <div
                            onClick={() => { deleteChannel(channel) }}
                            className="ml-8 w-fit button bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                        >
                            delete Channel
                        </div>
                        </>:<>
                        <div className="font-bold font-large ml-3 border-solid">Archived</div>
                        </>}
                        
                    </div>
                </div>
            ))}
            </>
            :
            <>
            no bucks channels
            </>}
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