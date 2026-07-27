import { createContext, useContext, useState } from "react";

// ye context poore app mein login state share karega
const AuthContext = createContext();

export function AuthProvider({ children }) {
  // user info localStorage se uthao (refresh pe login bana rahe)
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  // login/register ke baad ye call hoga
  const login = (data) => {
    // data = { _id, name, email, token }
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data));
    setUser(data);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// chhota helper taaki har jagah useContext(AuthContext) na likhna pade
export function useAuth() {
  return useContext(AuthContext);
}
