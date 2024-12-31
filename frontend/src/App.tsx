import { useEffect, useState } from "react"
import { socket } from "./socket"
import Messages from "./components/Messages";

function App() {
  const [username, setUsername] = useState<string>("");
  const [isConnected, setIsConnected] = useState<boolean>(false);

  function handleConnect() {
    socket.auth = { username };
    socket.connect();
  }

  useEffect(() => {

    function handleConnect() {
      console.log("connected");
      setIsConnected(true);
    }
    function handleDisonnect() {
      console.log("disconnected");
      setIsConnected(false);
    }

    function handleError(err: any) {
      console.log(`connection error: ${err.message}`);
    }

    socket.on("connect_error", handleError)
    socket.on("connect", handleConnect)
    socket.on("disconnect", handleDisonnect)

    return () => {
      socket.off("connect", handleConnect)
      socket.off("connect_error", handleError)
      socket.off("disconnect", handleDisonnect)
    }
  }, [])

  return (
    <div className="flex flex-col">
      <h2>{ isConnected ? "connected" : "disconnected" }</h2>
      <label>Username</label>
      <input value={username} placeholder="Enter username" onChange={e => setUsername(e.target.value)} className="border-indigo-700 border-2 rounded-md" />
      <button disabled={!username} onClick={handleConnect}>Connect</button>
      {
        isConnected && <Messages username={username} />
      }
    </div>
  )
}

export default App
