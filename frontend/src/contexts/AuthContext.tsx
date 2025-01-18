import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { LoginRequestDto, RegisterRequestDto } from "../dto";
import AuthService from "../services/auth.service";
import { jwtDecode } from "jwt-decode";
import { useSocket } from "./socket-context";

interface AuthenticatedUser {
  token: string;
  userId: string;
  username: string;
}

interface JWToken {
  exp: number;
  iat: number;
  userId: string;
}

type AuthState =
  | { isAuthenticated: true; currentUserId: string; currentUsername: string; }
  | { isAuthenticated: false; currentUserId: null; currentUsername: null; };

interface AuthContextInterface {
  currentUserId: string | null;
  currentUsername: string | null;
  authToken: string | null;
  isAuthenticated: boolean;
  login: (input: LoginRequestDto) => Promise<boolean>;
  register: (input: RegisterRequestDto) => Promise<boolean>;
  logout: () => void;
  loginError: string;
  registerError: string;
  isLoginPending: boolean;
  isRegisterPending: boolean;
}

const LocalStorageUserKey = 'auth-user'

const AuthContext = createContext<AuthContextInterface>({
  currentUserId: null,
  currentUsername: null,
  authToken: null,
  isAuthenticated: false,
  login: async () => false, // Default value to indicate that login failed
  register: async () => false, // Default value to indicate that registration failed
  logout: () => {}, // Default empty function for logout
  loginError: '',
  registerError: '',
  isLoginPending: false,
  isRegisterPending: false,
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode}) {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUsername, setCurrentUsername] = useState<string | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [loginError, setLoginError] = useState<string>("");
  const [isLoginPending, setLoginPending] = useState<boolean>(false);
  const [registerError, setRegisterError] = useState<string>(""); 
  const [isRegisterPending, setRegisterPending] = useState<boolean>(false);

  const { connect, disconnect } = useSocket();

  const login = useCallback(async (loginDto: LoginRequestDto): Promise<boolean> => {
    setLoginError("");
    setLoginPending(true);
    try {
      const data = await AuthService.loginUser(loginDto);
      // successful login
      setCurrentUserId(data.userId);
      setCurrentUsername(data.username);
      setAuthToken(data.access_token);
      // save to cookies
      const authenticatedUser: AuthenticatedUser = {
        token: data.access_token,
        userId: data.userId,
        username: data.username,
      }
      localStorage.setItem(LocalStorageUserKey, JSON.stringify(authenticatedUser));
      setLoginPending(false);
      connect(data.userId);
      return true;
    } catch (error: any) {
      setLoginError(error.message);
      setLoginPending(false);
      return false;
    }
  }, []);

  const register = useCallback(async (registerDto: RegisterRequestDto): Promise<boolean> => {
    setRegisterError("");
    setRegisterPending(true);
    try {
      await AuthService.registerUser(registerDto);
      // success
      setRegisterPending(false);
      return true;
    } catch (error: any) {
      setRegisterError(error.message);
      setRegisterPending(false);
      return false
    }
  }, []);

  const logout = useCallback((): void => {
    setCurrentUserId("");
    setCurrentUsername("")
    setAuthToken("");
    localStorage.removeItem(LocalStorageUserKey);
    disconnect();
  }, []);

  const isAuthenticated = useMemo(() => !!currentUserId && !!authToken, [currentUserId, authToken]);

  useEffect(() => {
    const userString = (localStorage.getItem(LocalStorageUserKey));
    if (userString) {
      const user: AuthenticatedUser = JSON.parse(userString);
      if ((jwtDecode(user.token) as JWToken).exp * 1000 < Date.now()) {
        // jtw expired
        localStorage.removeItem(LocalStorageUserKey);
        alert("login session has expired");
        logout()
      } else {
        // login from cookies
        setCurrentUserId(user.userId);
        setCurrentUsername(user.username);
        setAuthToken(user.token);
        connect(user.userId);
      }
    }
  }, []);

  const value = useMemo(
    () => ({
      currentUserId,
      currentUsername,
      authToken,
      isAuthenticated,
      login,
      register,
      logout,
      loginError,
      registerError,
      isLoginPending,
      isRegisterPending,
    }), [
      currentUserId,
      currentUsername,
      authToken,
      isAuthenticated,
      login,
      register,
      logout,
      loginError,
      registerError,
      isLoginPending,
      isRegisterPending,
    ]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}