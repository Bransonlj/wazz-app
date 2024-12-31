import { useEffect, useState } from "react"
import { socket } from "../socket"

interface Message {
  message: string;
  from: string;
  recipient: string;
  createdAt: Date;
}

interface MessageOfUsers {
  username: string;
  messages: Message[];
}

export default function Messages({ username }: { username: string }) {

  const [userSearch, setUserSearch] = useState<string>("");

  const [selectedUser, SetSelectedUser] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<Map<string, Message[]>>(new Map()); // i should have just used map lol

  function handleSendMessage() {
    socket.emit("message", { recipient: selectedUser, message }, (res: Message) => {
      setMessages(prev => {
        const newMap = new Map(prev);
        if (!newMap.has(res.recipient)) {
          newMap.set(res.recipient, [res]);
        } else {
          newMap.set(res.recipient, [...(newMap.get(res.recipient) || []), res])
        }

        return newMap;
      })
    })

    setMessage(""); // clear message
  }

  function handleAddUser() {
    if (!messages.has(userSearch)) {
      setMessages(prev => {
        const newMap = new Map(prev);
        newMap.set(userSearch, []);
        return newMap;
      })
    }
  }

  useEffect(() => {
    socket.emit("get-all", (res: MessageOfUsers[]) => {
      console.log("refreshing all messages")
      const map = new Map<string, Message[]>();
      res.forEach(message => map.set(message.username, message.messages));
      setMessages(map);
    });

    function handleReceiveMessage(message: Message) {
      console.log(message);
      setMessages(prev => {
        const newMap = new Map(prev);
        if (!newMap.has(message.from)) {
          newMap.set(message.from, [message]);
        } else {
          newMap.set(message.from, [...(newMap.get(message.from) || []), message]);
        }

        return newMap;
      })
    }

    socket.on("message", handleReceiveMessage);

    return () => {
      socket.off("message", handleReceiveMessage);
    }

  },[username])

  return (
    <div>
      <input className="border-indigo-700 border-2 rounded-md" placeholder="find user" value={userSearch} onChange={e => setUserSearch(e.target.value)} />
      <button onClick={handleAddUser} disabled={!userSearch}>Add</button>
      <div className="flex">
      {
        [...messages.keys()].map(username => (
          <div 
            className={`${username === selectedUser ? "bg-indigo-300" : "bg-indigo-100"} border-2 border-indigo-700`}
            key={username} 
            onClick={() => SetSelectedUser(username)}
            >{ username }</div>
        ))
      }
      </div>
      <div>
      {
        messages.get(selectedUser)?.map((message, index) => (
          <div key={index}>
            <h2>{ message.from }</h2>
            <p> {message.message} </p>
          </div>
        ))
      }
      </div>
      <input className="border-indigo-700 border-2 rounded-md" placeholder="enter message" value={message} onChange={e => setMessage(e.target.value)} />
      <button onClick={handleSendMessage} disabled={!message || !selectedUser}>Send</button>
    </div>
  )
}