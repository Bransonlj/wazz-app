import { useEffect, useMemo, useState } from "react"
import { socket } from "../socket"
import { useNavigate, useParams } from "react-router";
import { Message, MessageOfUser } from "../dto";
import UserList from "./UserList";
import MessageUser from "./MessageUser";

export default function Messages({ username }: { username: string }) {

  const { id: selectedUser } = useParams()
  const navigate = useNavigate()

  const [userSearch, setUserSearch] = useState<string>("");
  const [messages, setMessages] = useState<Map<string, Message[]>>(new Map()); // i should have just used map lol

  const consolidatedUsers = useMemo(() => { // maybe dont need this
    const users = [...messages.keys()];
    if (selectedUser && !users.includes(selectedUser)) {
      users.unshift(selectedUser);
    }

    return users;
  }, [messages, selectedUser]);

  /**
   * Callback function after successful sending of message through socket.
   * Updates the list of messages with the message that was sent
   */
  function afterSendCallback(res: Message) {
    setMessages(prev => {
      const newMap = new Map(prev);
      if (!newMap.has(res.recipient)) {
        newMap.set(res.recipient, [res]);
      } else {
        newMap.set(res.recipient, [...(newMap.get(res.recipient) || []), res])
      }

      return newMap;
    })
  }

  function handleAddUser() {
    navigate(`/t/${userSearch}`);
  }


  useEffect(() => {
    socket.emit("get-all", (res: MessageOfUser[]) => {
      console.log("refreshing all messages")
      // convert resposnse to map of users and messages
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
      <div className="flex gap-4">
        <UserList users={consolidatedUsers} selectedUser={selectedUser || ""} />

        {
          selectedUser && <MessageUser selectedUser={selectedUser} messages={messages.get(selectedUser) || []} currentUser={username} afterSend={afterSendCallback}/>
        }
      </div>
    </div>
  )
}
