import { useQuery } from "@tanstack/react-query";
import MessageInput from "./message-input";
import MessageList from "./message-list";
import UserService from "@/services/user.service";
import { UserConversationDto, UserDto } from "@/dto";
import ErrorFeedback from "./error-feedback";

interface UserConversationProps {
  selectedUser: string;
  currentUser: string;
  conversation: UserConversationDto | null
  onSendMessage?: (message: string, user: UserDto) => void;
  onRead?: (messageId: string, userId: string) => void;
}

export default function UserConversation({ selectedUser, currentUser, conversation, onSendMessage, onRead }: UserConversationProps) {

  const { 
    data,
    isSuccess,
    isError,
    isPending,
    error,
  } = useQuery({
    queryKey: ["user", selectedUser],
    queryFn: () => UserService.findById(selectedUser)
  })  

  function handleSendMessage(value: string) {
    if (isSuccess) {
      onSendMessage?.(value, {
        _id: selectedUser,
        username: data.username,
      })
    }
  }

  if (isPending) {
    return <div>Loading...</div>
  }

  if (isError) {
    return <ErrorFeedback message={error.message} />
  }

  return (
    <div className="flex gap-4 border-black border w-full h-full">
      <h2>{ data?.username || "unkown user" }</h2>
      <MessageList onRead={onRead} conversation={conversation} currentUser={currentUser} />
      <MessageInput onSend={handleSendMessage} />
    </div>
  )
}