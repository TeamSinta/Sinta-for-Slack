import React from 'react';

const DeleteConversationButton = () => {
  const deleteConversation = async () => {
    return
    // try {
    //   let channelId = ''
    //   const response = await fetch('/api/slack/archive', {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify({ channelId }),
    // });

    // // const response = await fetch("/api/hiringroom", {
    // //     // const response = await fetch("https://slack.com/api/conversations.create", {
    // //     method: "POST",
    // //     headers: {
    // //         "Content-Type": "application/json",
    // //         // Authorization: `Bearer ${accessToken}`,
    // //     },
    // //     body: JSON.stringify(hiringroomValue),
    // // });

    //   if (response.ok) {
    //     onSuccess();
    //   } else {
    //     const errorData = await response.json();
    //     onError(errorData.error);
    //   }
    // } catch (error) {
    //   onError(error.message);
    // }
  };

  return (
    <button onClick={deleteConversation} className="bg-red-500 text-white p-2 rounded">
      Delete Conversation
    </button>
  );
};

export default DeleteConversationButton;
