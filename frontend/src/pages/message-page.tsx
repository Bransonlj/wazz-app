import Messages from "@/components/Messages";
import { useAuth } from "@/contexts/AuthContext";

export default function MessagePage() {

  const { currentUserId, currentUsername } = useAuth()

  if (!currentUserId || !currentUsername) {
    return <div>Login to start messaging</div>
  }

  return (
    <Messages user={{ _id: currentUserId, username: currentUsername }}/>
  )
}