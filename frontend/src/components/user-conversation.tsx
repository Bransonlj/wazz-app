import { useQuery } from "@tanstack/react-query";
import MessageInput from "./message-input";
import MessageList from "./message-list";
import UserService from "@/services/user.service";
import { UserConversationDto, UserDto } from "@/dto";
import ErrorFeedback from "./error-feedback";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Separator } from "./ui/separator";

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
    <div className="flex flex-col w-full h-full">
      <div className="flex items-center">
        <Avatar>
          <AvatarImage src="avatar.png"></AvatarImage>
          <AvatarFallback>{data.username[0]}</AvatarFallback>
        </Avatar>
        <h2 className="p-2 font-semibold">{data.username}</h2>
      </div>
      <Separator className="mt-2" />
      <MessageList onRead={onRead} conversation={conversation} currentUser={currentUser} />
      <MessageInput onSend={handleSendMessage} />
    </div>
  )
}