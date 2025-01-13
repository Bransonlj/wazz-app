import { useNavigate } from "react-router";
import UserCard from "./UserCard";
import { UserDetailDto } from "../dto";

interface UserConversationListProps {
  users: UserDetailDto[], 
  selectedUser?: string,
  unreadMessages: {
    [userId: string]: string[];
  };
}

export default function UserConversationList({ users, selectedUser, unreadMessages}: UserConversationListProps) {

  const navigate = useNavigate();
  
  function handleSelectUser(user: string) {
    navigate(`/t/${user}`);
  }

  return (
      <div className="flex flex-col gap-1">
      {
        users.map(user => (
          <UserCard key={user.id} numUnreadMessages={unreadMessages[user.id]?.length} username={user.username} active={user.username === selectedUser} onClick={() => handleSelectUser(user.username)} />
        ))
      }
      </div>
  )
}