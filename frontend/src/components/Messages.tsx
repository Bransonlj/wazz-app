import { useEffect } from "react"
import { useParams } from "react-router";
import { UserDto } from "../dto";
import UserConversationList from "./user-conversation-list";
import UserSearch from "./user-search";
import { useSocketMessage } from "@/hooks/use-socket-message";
import UserConversation from "./user-conversation";

export default function Messages({ user }: { user: UserDto }) {

  const { id: selectedUser } = useParams()

  const {
    userDetails,
    unreadMessages,
    handleMessageRead,
    getConversationWithUserId,
    sendMessage,
    loadMessages,
  } = useSocketMessage(user);

  useEffect(() => {
    // to reload message state when page is reloaded.
    loadMessages();
  }, [user]);

  return (
    <div>
      <UserSearch />
      <UserConversationList users={userDetails} unreadMessages={unreadMessages} selectedUser={selectedUser} />
      {
        selectedUser && <UserConversation 
          conversation={getConversationWithUserId(selectedUser)} 
          selectedUser={selectedUser}
          currentUser={user._id}
          onRead={handleMessageRead}
          onSendMessage={sendMessage}
        />
      }
    </div>
  )
}
