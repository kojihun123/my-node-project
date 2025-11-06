import { useEffect, useState } from "react";

type User = { id: number; email: string; name?: string | null };
type Health = { ok: boolean; time: string };

export default function App() {
  const [health, setHealth] = useState<Health | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    fetch("/api/health").then(r => r.json()).then(setHealth);
    fetch("/api/users").then(r => r.json()).then(setUsers);
  }, []);

  const addUser = async () => {
    const body = { email: `user${Date.now()}@test.com`, name: "New User" };
    await fetch("/api/users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    setUsers(await fetch("/api/users").then(r => r.json()));
  };

  return (
    <div style={{ padding: 24 }}>
      <h1>Fullstack App (TS + Prisma)</h1>
      <pre>{JSON.stringify(health, null, 2)}</pre>
      <button onClick={addUser}>Add User</button>
      <pre>{JSON.stringify(users, null, 2)}</pre>
    </div>
  );
}
