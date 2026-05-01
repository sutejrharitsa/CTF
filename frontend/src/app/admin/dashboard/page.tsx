"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "../../apiConfig";

export default function AdminDashboard() {
  const [isActive, setIsActive] = useState(false);
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [challenges, setChallenges] = useState([]);
  const [newChallenge, setNewChallenge] = useState({ title: "", description: "", points: 100, flag: "", trim_spaces: false, ignore_case: false });
  const [selectedFile, setSelectedFile] = useState<FileList | null>(null);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    if (!token || role !== "admin") {
      router.push("/admin");
      return;
    }
    fetchState();
    fetchChallenges();
  }, []);

  const fetchState = async () => {
    const res = await fetch(`${API_BASE_URL}/api/contest/state`);
    const data = await res.json();
    setIsActive(data.is_active);
  };

  const fetchChallenges = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_BASE_URL}/api/challenges`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      setChallenges(await res.json());
    }
  };

  const toggleState = async () => {
    const token = localStorage.getItem("token");
    await fetch(`${API_BASE_URL}/api/admin/contest/state`, {
      method: "PUT",
      headers: { 
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ is_active: !isActive, duration_minutes: !isActive ? durationMinutes : null })
    });
    fetchState();
  };

  const addChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isActive) {
      setError("Cannot add challenges while contest is active.");
      return;
    }
    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("title", newChallenge.title);
    formData.append("description", newChallenge.description);
    formData.append("points", newChallenge.points.toString());
    formData.append("flag", newChallenge.flag);
    formData.append("trim_spaces", newChallenge.trim_spaces.toString());
    formData.append("ignore_case", newChallenge.ignore_case.toString());
    if (selectedFile) {
      for (let i = 0; i < selectedFile.length; i++) {
        formData.append("files", selectedFile[i]);
      }
    }

    const res = await fetch(`${API_BASE_URL}/api/admin/challenges`, {
      method: "POST",
      headers: { 
        Authorization: `Bearer ${token}`
      },
      body: formData
    });
    if (res.ok) {
      setNewChallenge({ title: "", description: "", points: 100, flag: "", trim_spaces: false, ignore_case: false });
      setSelectedFile(null);
      const fileInput = document.getElementById('challenge-files') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      fetchChallenges();
      setError("");
    } else {
      const data = await res.json();
      let errorMsg = "Failed to add challenge";
      if (data.detail) {
        if (typeof data.detail === "string") errorMsg = data.detail;
        else if (Array.isArray(data.detail)) errorMsg = data.detail[0].msg;
      }
      setError(errorMsg);
    }
  };

  const deleteChallenge = async (id: number) => {
    if (isActive) {
      setError("Cannot delete challenges while contest is active.");
      return;
    }
    const token = localStorage.getItem("token");
    await fetch(`${API_BASE_URL}/api/admin/challenges/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchChallenges();
  };

  const clearLeaderboard = async () => {
    if (!confirm("Are you sure you want to clear the leaderboard?")) return;
    const token = localStorage.getItem("token");
    await fetch(`${API_BASE_URL}/api/admin/leaderboard`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });
    alert("Leaderboard cleared.");
  };

  const clearUsers = async () => {
    if (!confirm("Are you sure? This will delete ALL student accounts and their submissions!")) return;
    const token = localStorage.getItem("token");
    await fetch(`${API_BASE_URL}/api/admin/users`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });
    alert("All users cleared.");
  };

  const logout = () => {
    localStorage.clear();
    router.push("/admin");
  };

  return (
    <div>
      <div className="nav-bar">
        <h2>Admin Dashboard [root]</h2>
        <div className="nav-links">
          <Link href="/leaderboard">Leaderboard</Link>
          <button onClick={logout} style={{ padding: "0.4rem 1rem" }}>Logout</button>
        </div>
      </div>

      <div className="container">
        {error && <div className="error-message">{error}</div>}

        <div className="card" style={{ marginBottom: "2rem" }}>
          <h3>Contest Control</h3>
          <p>Status: <span className={isActive ? "badge badge-active" : "badge badge-inactive"}>{isActive ? "ACTIVE" : "INACTIVE"}</span></p>
          
          {!isActive && (
            <div style={{ marginTop: "1rem" }}>
              <label>Timer Duration (Minutes): </label>
              <input 
                type="number" 
                value={durationMinutes} 
                onChange={(e) => setDurationMinutes(parseInt(e.target.value))} 
                style={{ width: "100px", display: "inline-block", marginLeft: "1rem", marginBottom: 0 }} 
                min="1"
              />
            </div>
          )}

          <div style={{ marginTop: "1rem", display: "flex", gap: "1rem" }}>
            <button onClick={toggleState}>
              {isActive ? "Deactivate Contest" : "Activate Contest"}
            </button>
            <button onClick={clearLeaderboard} style={{ borderColor: "var(--error-color)", color: "var(--error-color)" }}>
              Clear Leaderboard
            </button>
            <button onClick={clearUsers} style={{ borderColor: "var(--error-color)", color: "var(--error-color)" }}>
              Clear All Users
            </button>
          </div>
        </div>

        <div className="grid">
          <div className="card">
            <h3>Add Challenge</h3>
            <form onSubmit={addChallenge}>
              <input type="text" placeholder="Title" value={newChallenge.title} onChange={e => setNewChallenge({...newChallenge, title: e.target.value})} required disabled={isActive} />
              <textarea placeholder="Description" rows={3} value={newChallenge.description} onChange={e => setNewChallenge({...newChallenge, description: e.target.value})} required disabled={isActive}></textarea>
              <input type="number" placeholder="Points" value={newChallenge.points} onChange={e => setNewChallenge({...newChallenge, points: parseInt(e.target.value)})} required disabled={isActive} />
              <input type="text" placeholder="Flag (e.g. CTF{secret})" value={newChallenge.flag} onChange={e => setNewChallenge({...newChallenge, flag: e.target.value})} required disabled={isActive} />
              <input id="challenge-files" type="file" multiple onChange={e => setSelectedFile(e.target.files)} disabled={isActive} style={{ padding: "0.5rem", background: "rgba(0,0,0,0.5)" }} />
              
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
                <input type="checkbox" id="trim" checked={newChallenge.trim_spaces} onChange={e => setNewChallenge({...newChallenge, trim_spaces: e.target.checked})} style={{ width: "auto", margin: 0 }} disabled={isActive} />
                <label htmlFor="trim">Trim all spaces</label>
              </div>
              
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
                <input type="checkbox" id="ignore" checked={newChallenge.ignore_case} onChange={e => setNewChallenge({...newChallenge, ignore_case: e.target.checked})} style={{ width: "auto", margin: 0 }} disabled={isActive} />
                <label htmlFor="ignore">Ignore Case</label>
              </div>
              
              <button type="submit" disabled={isActive} style={{ width: "100%" }}>Add Challenge</button>
            </form>
          </div>

          <div>
            <h3>Existing Challenges</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {challenges.map((c: any) => (
                <div key={c.id} className="card" style={{ padding: "1rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <h4>{c.title} ({c.points} pts)</h4>
                    <button onClick={() => deleteChallenge(c.id)} disabled={isActive} style={{ padding: "0.2rem 0.5rem", borderColor: "var(--error-color)", color: "var(--error-color)" }}>X</button>
                  </div>
                  <p style={{ fontSize: "0.9rem", color: "#aaa" }}>{c.description}</p>
                  {c.file_path && (() => {
                    try {
                      const files = JSON.parse(c.file_path);
                      return <p style={{ fontSize: "0.8rem", color: "var(--text-color)" }}>Files: {files.map((f: any) => f.original).join(", ")}</p>;
                    } catch { return <p style={{ fontSize: "0.8rem", color: "var(--text-color)" }}>File: {c.file_path}</p>; }
                  })()}
                  <p style={{ fontSize: "0.8rem", marginTop: "0.5rem" }}>Flag: {c.flag}</p>
                </div>
              ))}
              {challenges.length === 0 && <p>No challenges found.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
