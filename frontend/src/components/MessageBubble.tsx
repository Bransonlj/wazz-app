import { Message } from "../dto";

export default function MessageBubble({ message, isSender }: { message: Message, isSender: boolean }) {

  return (
    <div key={message._id} className={`${isSender ? "bg-green-300 self-end" : "bg-blue-300 self-start"}  rounded-lg p-1 flex flex-col gap-0 flex-none`}>
      { !isSender && <h2 className="text-lg font-semibold">{ message.from }</h2>}
      <p>{message.message}</p>
      <div className="flex gap-3">
        <span>{new Date(message.createdAt).toLocaleTimeString()}</span>
        <span>{message.status}</span>
      </div>
    </div>
  )
}