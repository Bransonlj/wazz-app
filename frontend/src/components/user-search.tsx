import { UserDto } from "@/dto";
import UserService from "@/services/user.service";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import ErrorFeedback from "./error-feedback";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Spinner } from "./ui/spinner";

interface UserSearchProps {
  onSearch?: (user: UserDto) => void;
}

export default function UserSearch({}: UserSearchProps) {
  const [searchString, setSearchString] = useState<string>("");
  const [enabled, setEnabled] = useState<boolean>(false);

  const navigate = useNavigate();

  function handleAddUser() {
    setEnabled(true);
  }

  const {
    data,
    isSuccess,
    error,
    isLoading,
    isError,
  } = useQuery({
      queryKey: ["username", searchString],
      queryFn: () => {
        console.log("query made")
        setEnabled(false)
        return UserService.findByUsername(searchString)
      },
      enabled,
  })

  useEffect(() => {
    if (isSuccess) {
      navigate(`/t/${data._id}`);
    }
  }, [data])

  return (
    <div className="flex flex-col pb-2">
      <div className="flex">
        <Input className="border border-rose-200 bg-rose-50" placeholder="Add user..." value={searchString} onChange={e => setSearchString(e.target.value)} />
        <Button className="bg-emerald-500" onClick={handleAddUser} disabled={!searchString || isLoading}>Add</Button>
      </div>
      {
        isLoading && <Spinner>Searching...</Spinner>
      }
      {
        isError && <ErrorFeedback message={error.message} />
      }
    </div>
  )
}