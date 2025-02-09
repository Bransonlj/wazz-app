import { useNavigate } from "react-router";
import UserCard from "./user-card";
import { UserDto } from "../dto";

interface UserConversationListProps {
  users: UserDto[], 
  selectedUser?: string,
  unreadMessages: {
    [userId: string]: string[];
  };
}

export default function UserConversationList({ users, selectedUser, unreadMessages}: UserConversationListProps) {

  const navigate = useNavigate();
  
  function handleSelectUser(userId: string) {
    navigate(`/t/${userId}`);
  }

  return (
      <div className="w-36 flex flex-col h-full border-2 bg-emerald-50 border-rose-200 rounded-md overflow-hidden">
      {
        users.map(user => (
          <UserCard 
            key={user._id} 
            numUnreadMessages={unreadMessages[user._id]?.length} 
            username={user.username || "username not found"} 
            active={user._id === selectedUser} 
            onClick={() => handleSelectUser(user._id)} />
        ))
      }
      </div>
  )
}