import { useState } from "react";
import { useNavigate } from "react-router";
import { UserDetailDto } from "../dto";

interface UserSearchProps {
  onSearch?: (user: UserDetailDto) => void;
}

export default function UserSearch({ onSearch }: UserSearchProps) {
  const [searchString, setSearchString] = useState<string>("");

  const navigate = useNavigate();

  function handleAddUser() {
    navigate(`/t/${searchString}`);
  }

  return (
    <div>
      <input className="border-indigo-700 border-2 rounded-md" placeholder="find user" value={searchString} onChange={e => setSearchString(e.target.value)} />
      <button onClick={handleAddUser} disabled={!searchString}>Add</button>
    </div>
  )
}