import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import ChatPage from "./pages/ChatPage.jsx";
import SplashScreen from "./components/SplashScreen.jsx";
import { useAuth } from "./state/AuthContext.jsx";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  // While checking auth, show splash only if logged in
  if (loading) {
    return user ? <SplashScreen /> : null;
  }

  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <ChatPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
