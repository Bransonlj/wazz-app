import { Badge } from "./ui/badge";

interface UserCardProps {
  username: string;
  active: boolean;
  onClick: () => void;
  numUnreadMessages?: number;
}

export default function UserCard({ username, active, onClick, numUnreadMessages=0 }: UserCardProps) {
  return (
    <div 
      className={`${active ? "bg-rose-200" : "bg-emerald-100 hover:cursor-pointer"} px-2 py-4 border-b-2 border-rose-200`}
      key={username} 
      onClick={onClick}
    >
      <span className=" text-zinc-700 p-2">{ username }</span> 
      {
        numUnreadMessages > 0 && <Badge variant="secondary">{numUnreadMessages}</Badge>
      }
    </div>
  )
}