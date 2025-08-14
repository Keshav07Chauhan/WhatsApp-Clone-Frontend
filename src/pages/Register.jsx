import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiRegister } from "../api/auth";

export default function Register() {
  const [name, setName] = useState("");
  const [wa_id, setWaId] = useState("");
  const [password, setPassword] = useState("");
  const nav = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiRegister(name, wa_id, password);
      alert("Registered! Please login.");
      nav("/login");
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div className="auth">
      <h2>Register</h2>
      <form onSubmit={handleSubmit} className="auth-form">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
        />
        <input
          value={wa_id}
          onChange={(e) => setWaId(e.target.value)}
          placeholder="Phone Number"
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          type="password"
        />
        <button type="submit">Create account</button>
      </form>
      <p className="auth-alt">
        Have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
}
