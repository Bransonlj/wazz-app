import { useEffect, useRef } from "react";
import { UserConversation as UserConversationDto } from "../hooks/use-message-state";
import MessageBubble from "./MessageBubble";
import { MessageStatus } from "../enums";

interface UserConversationProps {
  conversation: UserConversationDto | null;
  currentUser: string;
  onRead?: (messageId: string, userId: string) => void;
}

export default function UserConversation({ conversation, currentUser, onRead }: UserConversationProps) {

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const element = entry.target as HTMLElement; // convert to HTMLElement to access dataset property
            const { sender, id, status} = element.dataset;
            if (!sender || !id || !status) return;
            if (status === MessageStatus.DELIVERED && sender !== currentUser) {
              // trigger onRead if message is not read yet
 
              onRead?.(id, sender);
            }
            
          }
        })
      },
      {
        root: container,
        threshold: 0.5,
      }
    );

    const elements = Array.from(container.children);
    elements.forEach((el) => observer.observe(el));

    return () => {
        elements.forEach((el) => observer.unobserve(el));
    };
  }, [conversation]) // conversation state will affect the elements within the scroll container
  
  if (!conversation || Object.keys(conversation.byMessageId).length === 0) {
    return <div>
      Say something!
    </div>
  }

  return (
    <div ref={scrollContainerRef} className="flex flex-col gap-1 overflow-y-scroll max-h-96">
    {
      Object.keys(conversation.byMessageId).map(messageId => (
        <MessageBubble 
          key={messageId} 
          message={conversation.byMessageId[messageId]} 
          isSender={conversation.byMessageId[messageId].sender === currentUser}
          data-status={conversation.byMessageId[messageId].status}
          data-id={messageId}
          data-sender={conversation.byMessageId[messageId].sender}
           />
      ))
    }
    </div>
  )
}