import { useState } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";

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
    <div className="flex flex-col items-end">
      <Textarea className="border-rose-200 bg-rose-50" placeholder="Enter message" value={message} onChange={e => setMessage(e.target.value)} />
      <Button className="bg-emerald-500" onClick={handleSendMessage} size="sm" disabled={!message}>Send</Button>
    </div>
  )
}