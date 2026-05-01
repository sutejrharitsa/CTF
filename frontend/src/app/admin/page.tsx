"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "../apiConfig";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("role", data.role);
        router.push("/admin/dashboard");
      } else {
        const data = await res.json();
        setError(data.detail || "Login failed");
      }
    } catch (err) {
      setError("Server unreachable");
    }
  };

  return (
    <div>
      <div className="nav-bar">
        <h2 className="glitch" data-text="The CTF Shuffle [root]">The CTF Shuffle [root]</h2>
        <div className="nav-links">
          <Link href="/">Student Portal</Link>
        </div>
      </div>
      
      <div className="container" style={{ marginTop: "10vh", maxWidth: "500px" }}>
        <div className="card">
          <h2 style={{ textAlign: "center", color: "var(--error-color)" }}>Root Access</h2>
          {error && <div className="error-message">{error}</div>}
          <form onSubmit={handleLogin}>
            <div>
              <label>Username</label>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
            </div>
            <div>
              <label>Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <button type="submit" style={{ width: "100%", marginTop: "1rem" }}>Login as Admin</button>
          </form>
        </div>
      </div>
    </div>
  );
}
