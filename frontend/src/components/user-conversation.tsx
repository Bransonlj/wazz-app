import { Message } from "../dto";
import { UserConversation as UserConversationDto } from "../hooks/use-message-state";
import MessageBubble from "./MessageBubble";

interface UserConversationProps {
  conversation: UserConversationDto | null;
  currentUser: string;
  onRead?: (message: Message) => void;
}

export default function UserConversation({ conversation, currentUser }: UserConversationProps) {
  
  if (!conversation || Object.keys(conversation.byMessageId).length === 0) {
    return <div>
      Say something!
    </div>
  }

  return (
    <div className="flex flex-col gap-1 overflow-y-scroll max-h-96">
    {
      Object.keys(conversation.byMessageId).map(messageId => (
        <MessageBubble 
        key={messageId} 
        message={conversation.byMessageId[messageId]} 
        isSender={conversation.byMessageId[messageId].sender === currentUser} />
      ))
    }
    </div>
  )
}