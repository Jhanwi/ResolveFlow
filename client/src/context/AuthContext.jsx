import { createContext, useContext, useState } from "react";
import {
  login as loginUser,
  register as registerUser,
  logout as logoutUser,
  getUser
} from "../services/authService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getUser());

  const login = async (data) => {
    const result = await loginUser(data);
    setUser(result.user);

    return result;
  };

  const register = async (data) => {
    const result = await registerUser(data);
    setUser(result.user);

    return result;
  };

  const logout = () => {
    logoutUser();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};