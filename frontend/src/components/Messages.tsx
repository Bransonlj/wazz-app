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
    <div className="min-h-0 flex-1 flex w-full items-center justify-center p-6">
      <div className="flex flex-col w-full h-full max-w-2xl bg-white border-2 border-rose-100 p-6 rounded-lg">
        <UserSearch />
        <div className="min-h-0 flex-1 flex gap-1 items-center">
          <UserConversationList users={userDetails} unreadMessages={unreadMessages} selectedUser={selectedUser} />
          {
            selectedUser ? <UserConversation 
              conversation={getConversationWithUserId(selectedUser)} 
              selectedUser={selectedUser}
              currentUser={user._id}
              onRead={handleMessageRead}
              onSendMessage={sendMessage}
            />
            : <div className="flex-1 flex justify-center text-zinc-500">Start a conversation</div>
          }
        </div>
      </div>
    </div>
  )
}
