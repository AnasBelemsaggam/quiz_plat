import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    try {
      const user = await login({ email, password });

      // role redirect
      if (user.role === "admin") navigate("/admin");
      else if (user.role === "teacher") navigate("/teacher");
      else navigate("/student");
    } catch (e) {
      setErr(e?.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
      <div className="w-full max-w-md bg-white border rounded-xl p-6 shadow-sm">
        <h1 className="text-2xl font-bold">Log in</h1>
        <p className="text-sm text-gray-600 mt-1">Access your dashboard</p>

        {err && (
          <div className="mt-4 text-sm bg-red-50 border border-red-200 text-red-700 p-3 rounded">
            {err}
          </div>
        )}

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-medium">Email</label>
            <input
              className="mt-1 w-full border rounded-md px-3 py-2 outline-none focus:ring"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@test.com"
              type="email"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">Password</label>
            <input
              className="mt-1 w-full border rounded-md px-3 py-2 outline-none focus:ring"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              type="password"
              required
            />
          </div>

          <button className="w-full bg-blue-600 text-white rounded-md py-2 font-medium">
            Log in
          </button>
        </form>
      </div>
    </div>
  );
}