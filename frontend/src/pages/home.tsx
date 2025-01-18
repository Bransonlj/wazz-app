import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";

export default function Home() {

  const navigate = useNavigate();

  return (
    <div>
      <h2>Start Messaging!</h2>
      <Button onClick={() => navigate("/t")}>Messages</Button>
    </div>
  )
}