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
import { useAuth } from "@/contexts/AuthContext";
import { useSocketMessage } from "@/hooks/use-socket-message";

export default function Messages({ userId }: { userId: string }) {

  const { id: selectedUser } = useParams()
  //const { currentUserId } = useAuth();

  const {
    userDetails,
    unreadMessages,
    handleMessageRead,
    getConversationWithUserId,
    sendMessage,
    loadMessages,
  } = useSocketMessage(userId);

  useEffect(() => {
    console.log("rendering")
    loadMessages();
  }, [userId]);

  return (
    <div>
      <UserSearch />
      <div className="flex gap-4 border-black border w-full h-full">
        <UserConversationList users={userDetails} unreadMessages={unreadMessages} selectedUser={selectedUser} />

        {
          selectedUser && <UserConversation onRead={handleMessageRead} conversation={getConversationWithUserId(selectedUser)} currentUser={userId} />
        }
        {
          selectedUser && <MessageInput onSend={(value) => sendMessage(value, selectedUser)} />
        }
      </div>
    </div>
  )
}
