import Messages from "@/components/Messages";
import { useAuth } from "@/contexts/AuthContext";
import { useSocket } from "@/contexts/socket-context"

export default function MessagePage() {

  const { isConnected } = useSocket();
  const { isAuthenticated, currentUserId } = useAuth()

  if (!currentUserId) {
    return <div>Login to start messaging</div>
  }

  return (
    <Messages userId={currentUserId}/>
  )
}