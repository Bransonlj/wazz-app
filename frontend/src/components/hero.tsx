import { Link } from "react-router";
import { Separator } from "./ui/separator";

export default function Hero() {

  return (
    <div className="flex flex-col items-center p-8">
      <h2 className="text-5xl font-bold text-emerald-400 p-2">Wazz App</h2>
      <p className="text-zinc-600">Simple chat messaging app between users</p>
      <Separator className="my-4" />
      <Link className="border-b-2 border-black" to={"/t"}>Start messaging here!</Link>
    </div>
  )
}