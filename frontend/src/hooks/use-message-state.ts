import { useMemo, useState } from "react";
import { Message, UserDetailDto } from "../dto";
import { getOtherUserOfMessage } from "../utils";

export interface UserConversation {
  username: string;
  byMessageId: {
    [messageId: string]: Message;
  }
}

export interface MessageState {
  byUserId: {
    [userId: string]: UserConversation;
  };
}

export function useMessageState() {
  const [messageState, setMessageState] = useState<MessageState>({ byUserId: {} });

  function loadMessageState(state: MessageState) {
    setMessageState(state)
  }

  function addMessage(message: Message, userId: string, username: string) {
    setMessageState(prev => ({
      ...prev,
      byUserId: {
        ...prev.byUserId,
        [userId]: {
          username,
          byMessageId: {
            ...(prev.byUserId[userId]?.byMessageId || {}),
            [message._id]: message
          }
        }
      }
    }))
  }

  function updateMessage(message: Message, currentUser: string, tempId?: string) {
    const otherUser = getOtherUserOfMessage(message, currentUser);
    setMessageState(prev => {
      if (!prev.byUserId[otherUser]) {
        console.log(prev);
        console.error(`Error updating message for user ${otherUser} that does not have conversation with`);
        return prev;
      }
      let messagesToKeep = prev.byUserId[otherUser].byMessageId;
      if (tempId) {
        // delete message with tempId
        const { [tempId]: _, ...otherMessages} = prev.byUserId[otherUser].byMessageId
        messagesToKeep = otherMessages;
      }

      return {
        ...prev,
        byUserId: {
          ...prev.byUserId,
          [otherUser]: {
            ...prev.byUserId[otherUser],
            byMessageId: {
              ...messagesToKeep,
              [message._id]: message,
            }
          }
        }
      }
    });
  }

  function getUserConversation(userId: string): UserConversation | null {
    return messageState.byUserId[userId] || null;
  }

  const userDetails: UserDetailDto[] = useMemo(() => {
    return Object.keys(messageState.byUserId).map(userId => ({
      id: userId,
      username: messageState.byUserId[userId].username,
    }))
  }, [messageState]);

  return {
    getUserConversation,
    addMessage,
    updateMessage,
    loadMessageState,
    userDetails,
  }
  
}