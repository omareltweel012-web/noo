import { Router, Request, Response } from "express";
import { db } from "@workspace/db";
import { usersTable, sessionsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router = Router();

const ADMIN_PASSWORD = "OMar01018547595&";

// Simple in-memory admin session store
const adminSessions = new Set<string>();
import crypto from "crypto";

// POST /api/admin/login
router.post("/login", async (req: Request, res: Response) => {
  const { password } = req.body as { password?: string };
  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: "كلمة السر غير صحيحة" });
  }
  const token = crypto.randomBytes(32).toString("hex");
  adminSessions.add(token);
  return res.json({ success: true, message: token });
});

// Middleware to check admin auth
function requireAdmin(req: Request, res: Response, next: Function) {
  const token = req.headers["x-admin-token"] as string;
  if (!token || !adminSessions.has(token)) {
    return res.status(401).json({ error: "غير مصرح" });
  }
  next();
}

// GET /api/admin/users
router.get("/users", requireAdmin, async (req: Request, res: Response) => {
  const users = await db
    .select({
      id: usersTable.id,
      email: usersTable.email,
      isBanned: usersTable.isBanned,
      createdAt: usersTable.createdAt,
    })
    .from(usersTable)
    .orderBy(desc(usersTable.createdAt));

  // Check which users have active sessions
  const activeSessions = await db
    .select({ userId: sessionsTable.userId })
    .from(sessionsTable)
    .where(eq(sessionsTable.isActive, true));

  const activeUserIds = new Set(activeSessions.map((s) => s.userId));

  const result = users.map((u) => ({
    id: u.id,
    email: u.email,
    isBanned: u.isBanned,
    isActive: activeUserIds.has(u.id),
    createdAt: u.createdAt.toISOString(),
  }));

  return res.json(result);
});

// POST /api/admin/users/:userId/ban
router.post("/users/:userId/ban", requireAdmin, async (req: Request, res: Response) => {
  const userId = parseInt(req.params.userId);
  if (isNaN(userId)) return res.status(400).json({ error: "معرف مستخدم غير صحيح" });

  // Ban user
  await db.update(usersTable).set({ isBanned: true }).where(eq(usersTable.id, userId));

  // Kick user - invalidate all their sessions
  await db
    .update(sessionsTable)
    .set({ isActive: false })
    .where(eq(sessionsTable.userId, userId));

  return res.json({ success: true, message: "تم الحظر وتسجيل الخروج" });
});

// POST /api/admin/users/:userId/unban
router.post("/users/:userId/unban", requireAdmin, async (req: Request, res: Response) => {
  const userId = parseInt(req.params.userId);
  if (isNaN(userId)) return res.status(400).json({ error: "معرف مستخدم غير صحيح" });

  await db.update(usersTable).set({ isBanned: false }).where(eq(usersTable.id, userId));

  return res.json({ success: true, message: "تم رفع الحظر" });
});

export { router as adminRouter };
