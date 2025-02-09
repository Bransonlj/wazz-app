import { useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router';
import RegisterForm from '@/components/register-form';
import { useToast } from '@/hooks/use-toast';

export default function Register() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  async function handleRegisterSuccess() {
    toast({
      title: "Account registration successful!",
    });
    navigate("/accounts/login"); // should go to success page (same page but change render)
  }

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated])

  return (
    <div className="flex h-full w-full items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <RegisterForm onSuccess={handleRegisterSuccess}/>
      </div>
    </div>
  )
}