import { useState } from "react";

interface MessageInputProps {
  onSend: (value: string) => void;
}

export default function MessageInput({ onSend }: MessageInputProps) {
  const [message, setMessage] = useState<string>("");
  
  function handleSendMessage() {
    onSend(message);
    setMessage(""); // clear message
  }

  return (
    <div>
      <input className="border-indigo-700 border-2 rounded-md" placeholder="enter message" value={message} onChange={e => setMessage(e.target.value)} />
      <button onClick={handleSendMessage} disabled={!message}>Send</button>
    </div>
  )
}