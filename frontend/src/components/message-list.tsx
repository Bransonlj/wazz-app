import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import MessageBubble from "./message-bubble";
import { MessageStatus } from "../enums";
import { UserConversationDto } from "@/dto";

interface UserConversationProps {
  conversation: UserConversationDto | null;
  currentUser: string;
  onRead?: (messageId: string, userId: string) => void;
}

export interface MessageListHandle {
  scrollToBottom(): void;
}

const MessageList = forwardRef<MessageListHandle, UserConversationProps>(({
  conversation, 
  currentUser, 
  onRead 
}, ref) => {

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  // Function to scroll to the bottom
  const scrollToBottom = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: "smooth", // Use "auto" for instant scroll
      });
    }
  };

  useImperativeHandle<MessageListHandle, MessageListHandle>(ref, () => ({
    scrollToBottom,
  }));

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
    <div ref={scrollContainerRef} className="min-h-0 flex-1 flex flex-col gap-1 overflow-y-auto p-2">
    {
      Object.keys(conversation.byMessageId).map(messageId => (
        <MessageBubble 
          key={messageId} 
          message={conversation.byMessageId[messageId]} 
          isSender={conversation.byMessageId[messageId].sender._id === currentUser}
          data-status={conversation.byMessageId[messageId].status}
          data-id={messageId}
          data-sender={conversation.byMessageId[messageId].sender._id}
           />
      ))
    }
    </div>
  )
})

export default MessageList;