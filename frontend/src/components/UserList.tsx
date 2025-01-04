import { useNavigate } from "react-router";
import UserCard from "./UserCard";

export default function UserList({ users, selectedUser }:  { users: string[], selectedUser: string }) {

  const navigate = useNavigate();
  
  function handleSelectUser(user: string) {
    navigate(`/t/${user}`);
  }

  return (
      <div className="flex flex-col gap-1">
      {
        users.map(username => (
          <UserCard key={username}  username={username} isSelected={username === selectedUser} onClick={() => handleSelectUser(username)} />
        ))
      }
      </div>
  )
}