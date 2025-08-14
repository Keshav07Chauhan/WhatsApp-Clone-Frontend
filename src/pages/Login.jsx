import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiLogin } from "../api/auth";
import { useAuth } from "../state/AuthContext";

export default function Login() {
  const [wa_id, setWaId] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const nav = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await apiLogin(wa_id, password);
      // backend returns data: { user, accessToken, refreshToken }
      login(res.data.data.user);
      nav("/");
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div className="auth">
      <h2>Login</h2>
      <form onSubmit={handleSubmit} className="auth-form">
        <input
          value={wa_id}
          onChange={(e) => setWaId(e.target.value)}
          placeholder="WhatsApp ID (wa_id)"
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          type="password"
        />
        <button type="submit">Login</button>
      </form>
      <p className="auth-alt">
        No account? <Link to="/register">Register</Link>
      </p>
    </div>
  );
}
