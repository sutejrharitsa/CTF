"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "./apiConfig";

export default function Home() {
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (localStorage.getItem("token") && localStorage.getItem("role") === "student") {
      router.push("/dashboard");
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/api/student/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("role", data.role);
        router.push("/dashboard");
      } else {
        const data = await res.json();
        let errorMsg = "Login failed";
        if (typeof data.detail === "string") errorMsg = data.detail;
        else if (Array.isArray(data.detail)) errorMsg = data.detail[0].msg;
        setError(errorMsg);
      }
    } catch (err) {
      setError("Server unreachable");
    }
  };

  return (
    <div>
      <div className="nav-bar">
        <h2 className="glitch" data-text="The CTF Shuffle">The CTF Shuffle<span className="cursor"></span></h2>
        <div className="nav-links">
          <Link href="/leaderboard">Leaderboard</Link>
          <Link href="/admin">Admin Login</Link>
        </div>
      </div>
      
      <div className="container" style={{ marginTop: "10vh", maxWidth: "500px" }}>
        <div className="card">
          <h2 style={{ textAlign: "center" }}>Student Access</h2>
          {error && <div className="error-message">{error}</div>}
          <form onSubmit={handleLogin}>
            <div>
              <label>Your Name</label>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
            </div>
            <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
              <button type="submit" style={{ flex: 1 }}>Join the Contest</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
