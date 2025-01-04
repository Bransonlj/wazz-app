import { useState } from "react";
import { Message } from "../dto";
import MessageConversation from "./MessageConversation";
import { socket } from "../socket";

export default function MessageUser({ 
  selectedUser, 
  messages, 
  currentUser, 
  afterSend,
}: { 
  selectedUser: string, 
  messages: Message[], 
  currentUser: string, 
  afterSend: (message: Message) => void,
}) {
  
  const [message, setMessage] = useState<string>("");
  
  function handleSendMessage() {
    socket.emit("message", { recipient: selectedUser, message }, (res: Message) => {
      afterSend(res);
    })

    setMessage(""); // clear message
  }

  return (
    <div>
      <MessageConversation messages={messages} currentUser={currentUser} /> 
      <input className="border-indigo-700 border-2 rounded-md" placeholder="enter message" value={message} onChange={e => setMessage(e.target.value)} />
      <button onClick={handleSendMessage} disabled={!message || !selectedUser}>Send</button>
    </div>
  )
}