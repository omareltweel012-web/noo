import { Router, Request, Response } from "express";
import crypto from "crypto";
import { db } from "@workspace/db";
import { usersTable, sessionsTable, adminSessionsTable } from "@workspace/db";
import { eq, desc, and } from "drizzle-orm";

const router = Router();

const ADMIN_PASSWORD = "OMar01018547595&";
const OWNER_EMAIL = "omareltweel012@gmail.com";

async function getSessionEmail(token: string): Promise<string | null> {
  if (!token) return null;
  const rows = await db
    .select({ email: usersTable.email })
    .from(sessionsTable)
    .innerJoin(usersTable, eq(sessionsTable.userId, usersTable.id))
    .where(and(eq(sessionsTable.token, token), eq(sessionsTable.isActive, true)))
    .limit(1);
  return rows[0]?.email ?? null;
}

async function isValidAdminToken(token: string): Promise<boolean> {
  if (!token) return false;
  const rows = await db
    .select({ id: adminSessionsTable.id })
    .from(adminSessionsTable)
    .where(eq(adminSessionsTable.token, token))
    .limit(1);
  return rows.length > 0;
}

// POST /api/admin/login
router.post("/login", async (req: Request, res: Response) => {
  const { password } = req.body as { password?: string };
  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: "كلمة السر غير صحيحة" });
  }
  const sessionToken = req.headers["x-session-token"] as string;
  const email = await getSessionEmail(sessionToken);
  if (!email || email.toLowerCase() !== OWNER_EMAIL.toLowerCase()) {
    return res.status(403).json({ error: "غير مصرح لهذا الحساب" });
  }
  const token = crypto.randomBytes(32).toString("hex");
  await db.insert(adminSessionsTable).values({ token });
  return res.json({ success: true, message: token });
});

async function requireAdmin(req: Request, res: Response, next: Function) {
  const adminToken = req.headers["x-admin-token"] as string;
  const valid = await isValidAdminToken(adminToken);
  if (!valid) {
    return res.status(401).json({ error: "غير مصرح" });
  }
  const sessionToken = req.headers["x-session-token"] as string;
  const email = await getSessionEmail(sessionToken);
  if (!email || email.toLowerCase() !== OWNER_EMAIL.toLowerCase()) {
    return res.status(403).json({ error: "غير مصرح لهذا الحساب" });
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
      status: usersTable.status,
      createdAt: usersTable.createdAt,
    })
    .from(usersTable)
    .orderBy(desc(usersTable.createdAt));

  const activeSessions = await db
    .select({ userId: sessionsTable.userId })
    .from(sessionsTable)
    .where(eq(sessionsTable.isActive, true));

  const activeUserIds = new Set(activeSessions.map((s) => s.userId));

  const result = users.map((u) => ({
    id: u.id,
    email: u.email,
    isBanned: u.isBanned,
    status: u.status,
    isActive: activeUserIds.has(u.id),
    createdAt: u.createdAt.toISOString(),
  }));

  return res.json(result);
});

// POST /api/admin/users/:userId/approve
router.post("/users/:userId/approve", requireAdmin, async (req: Request, res: Response) => {
  const userId = parseInt(req.params.userId);
  if (isNaN(userId)) return res.status(400).json({ error: "معرف مستخدم غير صحيح" });

  await db.update(usersTable).set({ status: "approved" }).where(eq(usersTable.id, userId));
  return res.json({ success: true, message: "تمت الموافقة" });
});

// POST /api/admin/users/:userId/ban
router.post("/users/:userId/ban", requireAdmin, async (req: Request, res: Response) => {
  const userId = parseInt(req.params.userId);
  if (isNaN(userId)) return res.status(400).json({ error: "معرف مستخدم غير صحيح" });

  const target = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
  if (target[0]?.email.toLowerCase() === OWNER_EMAIL.toLowerCase()) {
    return res.status(403).json({ error: "لا يمكن حظر هذا الحساب" });
  }

  await db.update(usersTable).set({ isBanned: true }).where(eq(usersTable.id, userId));
  await db.update(sessionsTable).set({ isActive: false }).where(eq(sessionsTable.userId, userId));

  return res.json({ success: true, message: "تم الحظر وتسجيل الخروج" });
});

// POST /api/admin/users/:userId/unban
router.post("/users/:userId/unban", requireAdmin, async (req: Request, res: Response) => {
  const userId = parseInt(req.params.userId);
  if (isNaN(userId)) return res.status(400).json({ error: "معرف مستخدم غير صحيح" });

  await db.update(usersTable).set({ isBanned: false, status: "approved" }).where(eq(usersTable.id, userId));
  return res.json({ success: true, message: "تم رفع الحظر" });
});

export { router as adminRouter };
