import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// agar token nahi hai to home pe bhej do, warna page dikhao
export default function ProtectedRoute({ children }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return children;
}
