import { useEffect, useState } from "react";
import api from "../api";

export default function Dashboard() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    api.get("/api/users").then((res) => setUsers(res.data));
  }, []);

  return (
    <div>
      <h2>Dashboard</h2>
      <ul>
        {users.map((u) => (
          <li key={u.id}>{u.full_name} — {u.email}</li>
        ))}
      </ul>
    </div>
  );
}
