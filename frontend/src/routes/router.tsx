import { Route, Routes } from "react-router";
import Login from "@/pages/login";
import Register from "@/pages/register";
import MainLayout from "@/layouts/main-layout";
import Home from "@/pages/home";
import MessagePage from "@/pages/message-page";

export default function Router() {
  return (
    <Routes>
      <Route element={ <MainLayout /> }>
      <Route index element={<Home />} />
        <Route path='t'>
          <Route index element={<MessagePage />} />
          <Route path=':id' element={<MessagePage />} />
        </Route>
        <Route path="accounts" >
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
        </Route>
      </Route>
    </Routes>
  )
}