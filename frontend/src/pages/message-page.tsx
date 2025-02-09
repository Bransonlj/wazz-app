import Messages from "@/components/messages";
import { useAuth } from "@/contexts/AuthContext";

export default function MessagePage() {

  const { currentUserId, currentUsername } = useAuth()

  if (!currentUserId || !currentUsername) {
    return <div className="p-4 font-semibold text-lg text-zinc-700">Login now to start messaging!</div>
  }

  return (
    <Messages user={{ _id: currentUserId, username: currentUsername }}/>
  )
}