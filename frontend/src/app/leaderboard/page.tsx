"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "../apiConfig";

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const router = useRouter();
  const [role, setRole] = useState("");

  useEffect(() => {
    setRole(localStorage.getItem("role") || "");
    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 10000); // Auto-refresh every 10s
    return () => clearInterval(interval);
  }, []);

  const fetchLeaderboard = async () => {
    const res = await fetch(`${API_BASE_URL}/api/leaderboard`);
    if (res.ok) {
      setLeaderboard(await res.json());
    }
  };

  const getDashboardLink = () => {
    if (role === "admin") return "/admin/dashboard";
    if (role === "student") return "/dashboard";
    return "/";
  };

  return (
    <div>
      <div className="nav-bar">
        <h2 className="glitch" data-text="The CTF Shuffle">The CTF Shuffle<span className="cursor"></span></h2>
        <div className="nav-links">
          <Link href={getDashboardLink()}>Back to Portal</Link>
        </div>
      </div>

      <div className="container">
        <div className="card">
          <h2 style={{ textAlign: "center", marginBottom: "2rem" }}> Global Leaderboard</h2>
          
          {leaderboard.length === 0 ? (
            <p style={{ textAlign: "center", color: "var(--text-dim)" }}>No one has scored points yet. Be the first hacker!</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th style={{ width: "10%" }}>Rank</th>
                  <th style={{ width: "40%" }}>Hacker Alias</th>
                  <th style={{ width: "20%" }}>Points</th>
                  <th style={{ width: "30%" }}>Last Hack Time</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((user: any, idx: number) => (
                  <tr key={user.username} style={idx === 0 ? { color: "#ffdf00", fontWeight: "bold", textShadow: "0 0 10px rgba(255,223,0,0.5)" } : idx === 1 ? { color: "#c0c0c0" } : idx === 2 ? { color: "#cd7f32" } : {}}>
                    <td>{idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `#${idx + 1}`}</td>
                    <td>{user.username}</td>
                    <td>{user.score} pts</td>
                    <td>{new Date(user.last_submission).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
