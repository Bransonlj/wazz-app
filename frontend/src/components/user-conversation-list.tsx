import { useNavigate } from "react-router";
import UserCard from "./UserCard";
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
      <div className="flex flex-col gap-1">
      {
        users.map(user => (
          <UserCard key={user._id} numUnreadMessages={unreadMessages[user._id]?.length} username={user.username || "username not found"} active={user.username === selectedUser} onClick={() => handleSelectUser(user._id)} />
        ))
      }
      </div>
  )
}