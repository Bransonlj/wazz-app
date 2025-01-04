import { Outlet } from "react-router";

export default function MessagingLayout() {
  return (
    <div>
      <h2>Messaging Page</h2>
      <div className="my-6">
        <Outlet />
      </div>
    </div>
  )
}