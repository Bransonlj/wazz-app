interface UserCardProps {
  username: string;
  active: boolean;
  onClick: () => void;
  numUnreadMessages?: number;
}

export default function UserCard({ username, active, onClick, numUnreadMessages=0 }: UserCardProps) {
  return (
    <div 
      className={`${active ? "bg-indigo-300" : "bg-indigo-100"} border-2 border-indigo-700 p-2 rounded-md`}
      key={username} 
      onClick={onClick}
    >{ username } {numUnreadMessages > 0 && numUnreadMessages}</div>
  )
}