import { Message } from "../dto";
import MessageBubble from "./MessageBubble";

export default function MessageConversation({ messages, currentUser }: { messages: Message[], currentUser: string }) {
  
  if (messages.length === 0) {
    return <div>
      Say something!
    </div>
  }

  return (
    <div className="flex flex-col gap-1">
    {
      messages.map(message => (
        <MessageBubble message={message} isSender={message.from === currentUser} />
      ))
    }
    </div>
  )
}