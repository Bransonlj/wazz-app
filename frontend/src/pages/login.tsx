import { useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router';
import LoginForm from '@/components/login-form';

export default function Login() {

  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  function handleLoginSuccess() {
    // return to home page
    navigate("/"); 
  }

  useEffect(() => {
    if (isAuthenticated) {
      handleLoginSuccess();
    }
  }, [isAuthenticated])
  
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm onSuccess={handleLoginSuccess}/>
      </div>
    </div>
  )
}