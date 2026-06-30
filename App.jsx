import { useState } from "react";
import LoginForm from "./components/LoginForm";
import Dashboard from "./pages/Dashboard";

export default function App() {
  const [isLogin, setIsLogin] = useState(!!localStorage.getItem("token"));

  if (!isLogin) {
    return <LoginForm onLoginSuccess={() => setIsLogin(true)} />;
  }

  return <Dashboard onLogout={() => setIsLogin(false)} />;
}
