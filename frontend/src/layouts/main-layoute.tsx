import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Outlet, useNavigate } from "react-router";

export default function MainLayout() {
  const { logout, isAuthenticated, currentUsername } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  if (!isAuthenticated) return (
    <div>
      <div className="flex items-center gap-4" >
          <Button size="sm" onClick={() => navigate("/accounts/login")} variant="outline">Sign in</Button>
          <Button size="sm" onClick={() => navigate("/accounts/register")}>Sign up</Button>
      </div>
      <Outlet />
    </div>
  )

  return (
    <div>
      <div>
        <Button onClick={handleLogout}>logout</Button>
      </div>
      <Outlet />
    </div>
  )
}