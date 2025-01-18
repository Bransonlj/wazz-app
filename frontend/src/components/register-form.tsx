import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router";
import ErrorFeedback from "./error-feedback";
import { useState } from "react";

export default function RegisterForm({
  onSuccess,
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div"> & { onSuccess: () => void } ) {

  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const { register, registerError, isRegisterPending } = useAuth();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const success = await register({
      username,
      password
    });
    if (success) {
      onSuccess();
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Register</CardTitle>
          <CardDescription>
            Enter your details below to register for an account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="example123"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required 
                />
              </div>
              <Button disabled={isRegisterPending} type="submit" className="w-full">
                Register
              </Button>
              {
                registerError && <ErrorFeedback message={registerError} />
              }
            </div>
            <div className="mt-4 text-center text-sm">
              Already have an account?{" "}
              <Link to="/accounts/login" className="underline underline-offset-4">
                Sign in
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}