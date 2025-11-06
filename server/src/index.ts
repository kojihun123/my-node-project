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

// Health check
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

// Users API
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

// Serve React build (for production)
const clientDist = path.join(__dirname, "..", "..", "client", "dist");
app.use(express.static(clientDist));

app.use((req, res, next) => {
  if (req.path.startsWith("/api")) return next();
  res.sendFile(path.join(clientDist, "index.html"));
});

const port = Number(process.env.PORT) || 5000;
app.listen(port, () => {
  console.log(`✅ Server running on http://localhost:${port}`);
});
