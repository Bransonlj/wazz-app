import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Link, Outlet, useNavigate } from "react-router";

export default function MainLayout() {
  const { logout, isAuthenticated, currentUsername } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  const UnauthenticatedOptions = () => (
    <div className="flex items-center gap-4" >
        <Button className="bg-rose-50" size="sm" onClick={() => navigate("/accounts/login")} variant="outline">Sign in</Button>
        <Button className="bg-emerald-500 text-rose-50" size="sm" onClick={() => navigate("/accounts/register")}>Sign up</Button>
    </div>
  )

  const AuthenticatedOptions = () => (
    <div className="flex items-center gap-4">
      <h2 className="text-rose-50 text-sm">Welcome {currentUsername}!</h2>
      <Button className="bg-emerald-500 text-rose-50" onClick={handleLogout}>logout</Button>
    </div>
  )

  return (
    <div className="flex flex-col w-full h-full items-center bg-rose-50">
      <div className="w-full h-fit flex justify-around items-center py-2 bg-rose-600 border-b-2 border-rose-200">
        <Link className="text-rose-50 font-semibold" to={"/"}>Home</Link>
        <Link className="text-rose-50 font-semibold" to={"/t"}>Messages</Link>
        {
          isAuthenticated ? <AuthenticatedOptions /> : <UnauthenticatedOptions />
        }
      </div>
      <Outlet />
    </div>
  )
}