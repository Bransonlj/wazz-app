import { Message, MessagesByUserResponseDto, MessageStatusUpdateDto, SendMessageDto, SocketResponseDto } from "@/dto";
import { socket } from "@/socket";
import { useEffect } from "react";
import { useMessageState } from "./use-message-state";
import { MessageStatus } from "@/enums";
import { getOtherUserOfMessage } from "@/utils";

export function useSocketMessage(userId: string) {
  const {    
    getConversationWithUserId,
    addMessage,
    updateMessage,
    markMessageRead,
    updateMessageStatus,
    loadMessageState,
    userDetails,
    unreadMessages,
  } = useMessageState();

  function handleMessageRead(messageId: string, senderId: string) {
    markMessageRead(messageId, senderId);
    const messageStatusUpdateDto: MessageStatusUpdateDto = {
      messageId,
      userIdToInform: senderId,
      newStatus: MessageStatus.READ,
    }
    socket.emit("message-status-update", messageStatusUpdateDto);
  }

  async function sendMessage(messageString: string, recipient: string) {
    const message: SendMessageDto = {
      senderId: userId,
      recipientId: recipient,
      message: messageString,
    }

    const tempId = crypto.randomUUID();

    const optimisticMessage: Message = {
      _id: tempId,
      sender: { _id: userId } ,
      recipient: { _id: recipient },
      message: messageString,
      createdAt: new Date().toISOString(),
      status: MessageStatus.PENDING
    }

    addMessage({
      message: optimisticMessage, 
      userId: recipient, 
      username: recipient
    });

    try {
      const response: SocketResponseDto<Message | string> = await socket.timeout(10000).emitWithAck("message", message);
      if (response.status === "success") {
        // update the optimistic message to the real message
        updateMessage(response.data as Message, userId, tempId);
      } else {
        throw new Error("Error from server");
      }

    } catch (err) {
      updateMessage({ ...optimisticMessage, status: MessageStatus.ERROR }, userId, tempId);
    }
  }

  function loadMessages() {
    // fetch all messages for the current user
    socket.emit("get-all", (res: MessagesByUserResponseDto) => {
      console.log("refreshing all messages")
      console.log(res);
      loadMessageState({ byUserId: res.byUserId, unreadMessageIdsByUser: res.unreadMessageIdsByUser });
      // Next we have to send an update to for all messages with status < delivered
      res.undeliveredMessages.forEach(message => {
        const updateMessageDto: MessageStatusUpdateDto = {
          messageId: message._id,
          newStatus: MessageStatus.DELIVERED,
          userIdToInform: getOtherUserOfMessage(message, userId),
        }
        socket.emit("message-status-update", updateMessageDto);

        updateMessage({ ...message, status: MessageStatus.DELIVERED }, userId);
      });
    });
  }

  useEffect(() => {


    /**
     * ---------- Socket event Handlers------------
     */

    async function handleMessageReceived(message: Message) {
      const otherUser = getOtherUserOfMessage(message, userId);
      const deliveredMessage: Message = { ...message, status: MessageStatus.DELIVERED };
      const messageStatusUpdateDto: MessageStatusUpdateDto = {
        messageId: message._id,
        userIdToInform: otherUser,
        newStatus: MessageStatus.DELIVERED,
      }
  
      // inform server that message has been received/delivered successfully
      socket.emit("message-status-update", messageStatusUpdateDto);
      // TODO, do not need ack from server, just optimistically update client-side status to delivered, 
      // as it should be impossible for client to view a message that is not delivered technically
      addMessage({
        message: deliveredMessage, 
        userId: otherUser, 
        username: otherUser, 
        unread: true
      });
    }

    async function handleMessageStatusUpdate(updatedMessage: Message) {
      updateMessage(updatedMessage, userId);
    }

    // Subscribe to socket events
    socket.on("message", handleMessageReceived);
    socket.on("message-status-update", handleMessageStatusUpdate);

    return () => {
      socket.off("message", handleMessageReceived);
      socket.off("message-status-update", handleMessageStatusUpdate);
    }
  },[userId]);

  return {
    loadMessages,
    getConversationWithUserId,
    userDetails,
    unreadMessages,
    handleMessageRead,
    sendMessage,
  };
}