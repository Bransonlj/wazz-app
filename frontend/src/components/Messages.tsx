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
  const [messages, setMessages] = useState<MessageOfUsers[]>([]); // i should have just used map lol

  function handleSendMessage() {
    socket.emit("message", { recipient: selectedUser, message }, (res: Message) => {
      setMessages(prev => {
        const index = prev.findIndex((val) => val.username === selectedUser);
        if (index === -1) {
          // never sent before
          return [...prev, { username: selectedUser, messages: [res] }];
        } else {
          // add the new message
          prev[index].messages.push(res);
          return [...prev];
        }
      })
    })
  }

  function handleAddUser() {
    // plesae dont add users that are already present :(
    setMessages(prev => [...prev, { username: userSearch, messages: []}]);
    SetSelectedUser(userSearch);
  }

  useEffect(() => {
    socket.emit("get-all", (res: MessageOfUsers[]) => {
      console.log("refreshing all messages")
      setMessages(res);
    });

    function handleReceiveMessage(message: Message) {
      console.log(message);
      setMessages(prev => {
        const index = prev.findIndex((val) => val.username === message.from);
        if (index === -1) {
          // never sent before
          return [...prev, { username: message.from, messages: [message] }];
        } else {
          // add the new message
          prev[index].messages.push(message);
          return [...prev];
        }
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
        messages.map(message => (
          <div 
            className={`${message.username === selectedUser ? "bg-indigo-300" : "bg-indigo-100"} border-2 border-indigo-700`}
            key={message.username} 
            onClick={() => SetSelectedUser(message.username)}
            >{ message.username }</div>
        ))
      }
      </div>
      <div>
      {
        messages.find(val => val.username === selectedUser)?.messages.map((message, index) => (
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