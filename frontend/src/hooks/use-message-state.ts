import { useMemo, useState } from "react";
import { Message, UserDetailDto } from "../dto";
import { getOtherUserOfMessage } from "../utils";
import { MessageStatus } from "../enums";

export interface UserConversation {
  username: string;
  byMessageId: {
    [messageId: string]: Message;
  }
}

interface UnreadMessageIdsByUser {
  [userId: string]: string[];
}

export interface MessageState {
  byUserId: {
    [userId: string]: UserConversation;
  };
  unreadMessageIdsByUser: UnreadMessageIdsByUser;
}

/**
 * State management hook for messages and details
 * @returns 
 */
export function useMessageState() {
  const [messageState, setMessageState] = useState<MessageState>({ byUserId: {}, unreadMessageIdsByUser: {} });

  function loadMessageState(state: MessageState) {
    setMessageState(state)
  }

  function addMessage(
    { message, userId, username, unread=false }: { message: Message, userId: string, username: string, unread?: boolean }
  ) {
    setMessageState(prev => {
      const unreadMessages: UnreadMessageIdsByUser = unread 
        ? { // add message to unread messages if unread flag is true
          ...prev.unreadMessageIdsByUser,
          [userId]: prev.unreadMessageIdsByUser[userId] // check if user is already key in unread messages
            ? [...prev.unreadMessageIdsByUser[userId], message._id]
            : [message._id] 
        } : { ...prev.unreadMessageIdsByUser };

      return {
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
        },
        unreadMessageIdsByUser: unreadMessages,
      }
    })
  }

  function markMessageRead(id: string, sender: string) {
    setMessageState(prev => {
      if (!prev.unreadMessageIdsByUser[sender] || prev.unreadMessageIdsByUser[sender].length === 0) {
        console.warn(`Error marking message as read for user ${sender} that does not have unread messages`);
        return prev;
      }

      const messageIndex = prev.unreadMessageIdsByUser[sender].findIndex(_id => _id === id);
      if (messageIndex === -1) {
        console.warn(`Error marking message as read for message ${id} that is not unread`);
        return prev;
      }

      return {
        ...prev,
        unreadMessageIdsByUser: {
          ...prev.unreadMessageIdsByUser,
          [sender]: prev.unreadMessageIdsByUser[sender].splice(messageIndex, 1),
        }
      }
    });

    updateMessageStatus({
      id,
      otherUser: sender,
      newStatus: MessageStatus.READ,
    });
  }

  /**
   * Updates the status of a specific message in the state.
   * Does not update if specified user or message does not exist in the MessageState
   *
   * @param {Object} params - The parameters for updating the message status.
   * @param {string} params.id - The ID of the message to update.
   * @param {string} params.otherUser - The ID of the other user in the conversation.
   * @param {MessageStatus} params.newStatus - The new status to set for the message.
   */
  function updateMessageStatus(
    { id, otherUser, newStatus }: { id: string, otherUser: string, newStatus: MessageStatus }
  ) {
    setMessageState(prev => {
      if (!prev.byUserId[otherUser]) {
        console.warn(`Error updating message for user ${otherUser} that does not have conversation with`);
        return prev;
      }

      if (!prev.byUserId[otherUser].byMessageId[id]) {
        console.warn(`Error updating message for message ${id} that does not exist`);
        return prev;
      }

      return {
        ...prev,
        byUserId: {
          ...prev.byUserId,
          [otherUser]: {
            ...prev.byUserId[otherUser],
            byMessageId: {
              ...prev.byUserId[otherUser].byMessageId,
              [id]: {
                ...prev.byUserId[otherUser].byMessageId[id],
                status: newStatus,
              }
            }
          }
        }
      }
    });
  }

  function updateMessage(message: Message, currentUser: string, tempId?: string) {
    const otherUser = getOtherUserOfMessage(message, currentUser);
    setMessageState(prev => {
      if (!prev.byUserId[otherUser]) {
        console.warn(`Error updating message for user ${otherUser} that does not have conversation with`);
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

  const unreadMessages = useMemo(() => {
    return messageState.unreadMessageIdsByUser;
  }, [messageState])

  return {
    getUserConversation,
    addMessage,
    markMessageRead,
    updateMessage,
    updateMessageStatus,
    loadMessageState,
    userDetails,
    unreadMessages,
  }
  
}