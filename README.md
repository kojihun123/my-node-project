# 0) 프로젝트 생성 (루트)

```powershell
mkdir C:\Users\user\Desktop\fullstack-app
cd C:\Users\user\Desktop\fullstack-app
npm init -y
npm i -D concurrently
```

## ✅ 루트 `package.json` — **scripts 부분만** 이렇게 수정해!

> 파일 전체 갈아끼우지 말고, **"scripts"만** 아래처럼 바꿔 넣어.

```json
"scripts": {
  "dev": "concurrently \"npm --prefix server run dev\" \"npm --prefix client run dev\"",
  "build": "npm --prefix client run build && npm --prefix server run build",
  "start": "npm --prefix server run start"
}
```

---

# 1) 서버 (Express + TypeScript + Prisma / SQLite)

```powershell
mkdir server
cd server
npm init -y
npm i express cors dotenv @prisma/client
npm i -D typescript tsx prisma @types/express @types/cors @types/node
npx tsc --init
```

## `server/tsconfig.json` (핵심 옵션만)

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022"],
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true,
    "outDir": "dist",
    "rootDir": "src",
    "resolveJsonModule": true
  },
  "include": ["src"]
}
```

## `.env`

```powershell
ni .env
```

`server/.env`

```
PORT=5000
DATABASE_URL="file:./dev.db"
```

## Prisma 초기화 & 스키마

```powershell
npx prisma init
```

`server/prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")  // ⚠️ 이 줄만! (env=... 같은거 쓰지 말기)
}

model User {
  id         Int      @id @default(autoincrement())
  email      String   @unique
  name       String?
  posts      Post[]
  createdAt  DateTime @default(now())
}

model Post {
  id        Int      @id @default(autoincrement())
  title     String
  content   String?
  published Boolean  @default(false)
  authorId  Int
  author    User     @relation(fields: [authorId], references: [id])
  createdAt DateTime @default(now())
}
```

## 마이그레이션 & 클라이언트 생성

```powershell
# 반드시 server 폴더에서!
npx prisma migrate dev --name init

# ⚠️ Prisma가 DATABASE_URL을 못 찾을 때 사용하는 "최종 해결" 커맨드:
$env:DATABASE_URL="file:./dev.db"; npx prisma generate
```

## 코드 파일

```powershell
mkdir src
ni src\db.ts
ni src\index.ts
```

`server/src/db.ts`

```ts
import { PrismaClient } from "@prisma/client";
export const prisma = new PrismaClient();
process.on("beforeExit", async () => { await prisma.$disconnect(); });
```

`server/src/index.ts`

```ts
import express, { Request, Response } from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { prisma } from "./db.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// Health
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

// Users
app.post("/api/users", async (req: Request, res: Response) => {
  try {
    const { email, name } = req.body;
    const user = await prisma.user.create({ data: { email, name } });
    res.json(user);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});
app.get("/api/users", async (_req, res) => {
  const users = await prisma.user.findMany({ include: { posts: true } });
  res.json(users);
});

// 정적 파일(빌드 후)
const clientDist = path.join(__dirname, "..", "..", "client", "dist");
app.use(express.static(clientDist));

// Express v5 대응: SPA fallback
app.use((req, res, next) => {
  if (req.path.startsWith("/api")) return next();
  res.sendFile(path.join(clientDist, "index.html"));
});

const port = Number(process.env.PORT) || 5000;
app.listen(port, () => {
  console.log(`✅ Server running on http://localhost:${port}`);
});
```

## `server/package.json` — **scripts 부분만** 이렇게 수정해!

> 파일 전체 바꾸지 말고, **"scripts"만** 아래처럼 교체.

```json
"scripts": {
  "dev": "prisma generate && tsx watch src/index.ts",
  "build": "tsc -p tsconfig.json",
  "start": "node dist/index.js",
  "postinstall": "prisma generate"
}
```

---

# 2) 클라이언트 (React + Vite + TypeScript)

```powershell
cd ..
npm create vite@latest client -- --template react-ts
cd client
npm i
```

`client/vite.config.ts`

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: { "/api": "http://localhost:5000" }
  }
});
```

`client/src/App.tsx`

```tsx
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
    await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
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
```

---

# 3) 실행 & 빌드

## 개발 실행

```powershell
cd ..
npm run dev
```

* 프론트: [http://localhost:5173](http://localhost:5173)
* API: [http://localhost:5000/api/health](http://localhost:5000/api/health)

## Prisma 클라이언트 생성이 또 삐끗하면(최종해결 커맨드)

```powershell
cd server
$env:DATABASE_URL="file:./dev.db"; npx prisma generate
cd ..
npm run dev
```

## 배포 모드

```powershell
npm run build   # (client 빌드 + server TS 컴파일)
npm run start   # Express가 client/dist 서빙 + API
```

* 접속: [http://localhost:5000](http://localhost:5000)
* 
