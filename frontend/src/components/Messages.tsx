import { useEffect, useMemo, useState } from "react"
import { socket } from "../socket"
import { useNavigate, useParams } from "react-router";
import { Message, MessagesByUserResponseDto, MessageStatusUpdateDto, SendMessageDto, SocketResponseDto } from "../dto";
import UserConversationList from "./user-conversation-list";
import UserSearch from "./user-search";
import { useMessageState } from "../hooks/use-message-state";
import { getOtherUserOfMessage } from "../utils";
import { MessageStatus } from "../enums";
import UserConversation from "./user-conversation";
import MessageInput from "./message-input";

export default function Messages({ username }: { username: string }) {

  const { id: selectedUser } = useParams()

  const {    
    getUserConversation,
    addMessage,
    updateMessage,
    updateMessageStatus,
    loadMessageState,
    userDetails,
  } = useMessageState();

  function handleMessageRead(messageId: string, senderId: string) {
    updateMessageStatus({
      id: messageId,
      otherUser: senderId,
      newStatus: MessageStatus.READ,
    });

    const messageStatusUpdateDto: MessageStatusUpdateDto = {
      messageId,
      userToInform: senderId,
      newStatus: MessageStatus.READ,
    }
    socket.emit("message-status-update", messageStatusUpdateDto);
  }

  async function handleMessageReceived(message: Message) {
    const otherUser = getOtherUserOfMessage(message, username);
    const deliveredMessage: Message = { ...message, status: MessageStatus.DELIVERED };
    const messageStatusUpdateDto: MessageStatusUpdateDto = {
      messageId: message._id,
      userToInform: otherUser,
      newStatus: MessageStatus.DELIVERED,
    }

    // inform server that message has been received/delivered successfully
    socket.emit("message-status-update", messageStatusUpdateDto);
    // TODO, do not need ack from server, just optimistically update client-side status to delivered, 
    // as it should be impossible for client to view a message that is not delivered technically
    addMessage(deliveredMessage, otherUser, otherUser);
  }

  async function handleSendMessage(messageString: string, recipient: string) {
    const message: SendMessageDto = {
      sender: username,
      recipient,
      message: messageString,
    }

    const tempId = crypto.randomUUID();

    const optimisticMessage: Message = {
      _id: tempId,
      sender: username,
      recipient: recipient,
      message: messageString,
      createdAt: new Date().toISOString(),
      status: MessageStatus.PENDING
    }

    addMessage(optimisticMessage, recipient, recipient);

    try {
      const response: SocketResponseDto<Message | string> = await socket.timeout(10000).emitWithAck("message", message);
      if (response.status === "success") {
        // update the optimistic message to the real message
        updateMessage(response.data as Message, username, tempId);
      } else {
        throw new Error("Error from server");
      }

    } catch (err) {
      updateMessage({ ...optimisticMessage, status: MessageStatus.ERROR }, username, tempId);
    }
  }

  async function handleMessageStatusUpdate(updatedMessage: Message) {
    updateMessage(updatedMessage, username);
  }

  useEffect(() => {
    // fetch all messages for the current user
    socket.emit("get-all", (res: MessagesByUserResponseDto) => {
      console.log("refreshing all messages")
      loadMessageState({ byUserId: res.byUserId });
      // Next we have to send an update to for all messages with status < delivered
      res.undeliveredMessages.forEach(message => {
        const updateMessageDto: MessageStatusUpdateDto = {
          messageId: message._id,
          newStatus: MessageStatus.DELIVERED,
          userToInform: getOtherUserOfMessage(message, username),
        }
        socket.emit("message-status-update", updateMessageDto);

        updateMessage({ ...message, status: MessageStatus.DELIVERED }, username);
      });
    });

    socket.on("message", handleMessageReceived);
    socket.on("message-status-update", handleMessageStatusUpdate);

    return () => {
      socket.off("message", handleMessageReceived);
      socket.off("message-status-update", handleMessageStatusUpdate);
    }
  },[username]);

  return (
    <div>
      <UserSearch />
      <div className="flex gap-4 border-black border w-full h-full">
        <UserConversationList users={userDetails} selectedUser={selectedUser} />

        {
          selectedUser && <UserConversation onRead={handleMessageRead} conversation={getUserConversation(selectedUser)} currentUser={username} />
        }
        {
          selectedUser && <MessageInput onSend={(value) => handleSendMessage(value, selectedUser)} />
        }
      </div>
    </div>
  )
}
