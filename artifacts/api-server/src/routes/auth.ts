import { Router, Request, Response } from "express";
import { db } from "@workspace/db";
import { usersTable, sessionsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import crypto from "crypto";

const router = Router();
const OWNER_EMAIL = "omareltweel012@gmail.com";

function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

async function getUserFromToken(token: string) {
  if (!token) return null;
  const session = await db
    .select()
    .from(sessionsTable)
    .where(and(eq(sessionsTable.token, token), eq(sessionsTable.isActive, true)))
    .limit(1);
  if (!session[0]) return null;
  const user = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, session[0].userId))
    .limit(1);
  if (!user[0] || user[0].isBanned) return null;
  return user[0];
}

// POST /api/auth/login
router.post("/login", async (req: Request, res: Response) => {
  const { email, deviceId } = req.body as { email?: string; deviceId?: string };
  if (!email || !email.includes("@")) {
    return res.status(400).json({ error: "البريد الإلكتروني غير صحيح" });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const isOwner = normalizedEmail === OWNER_EMAIL.toLowerCase();

  const existing = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, normalizedEmail))
    .limit(1);

  let user = existing[0];

  if (user) {
    if (user.isBanned) {
      return res.status(403).json({ error: "هذا البريد الإلكتروني محظور" });
    }
    if (user.status === "pending") {
      return res.status(403).json({ error: "طلبك في انتظار موافقة المشرف" });
    }
    // Device lock check (skip for owner)
    if (!isOwner && deviceId) {
      if (user.lockedDeviceId && user.lockedDeviceId !== deviceId) {
        return res.status(403).json({ error: "هذا البريد مرتبط بجهاز آخر — تواصل مع الدعم لفك الارتباط" });
      }
      // First login — lock the device
      if (!user.lockedDeviceId) {
        await db.update(usersTable).set({ lockedDeviceId: deviceId }).where(eq(usersTable.id, user.id));
      }
    }
  } else {
    // New user — owner is auto-approved, everyone else is pending
    const [newUser] = await db
      .insert(usersTable)
      .values({
        email: normalizedEmail,
        status: isOwner ? "approved" : "pending",
        isBanned: false,
        lockedDeviceId: null,
      })
      .returning();
    user = newUser;

    if (!isOwner) {
      return res.status(403).json({ error: "طلبك في انتظار موافقة المشرف" });
    }
  }

  // Invalidate all previous sessions (single session rule)
  await db
    .update(sessionsTable)
    .set({ isActive: false })
    .where(eq(sessionsTable.userId, user.id));

  const token = generateToken();
  await db.insert(sessionsTable).values({ userId: user.id, token, isActive: true });

  return res.json({ userId: user.id, email: user.email, sessionToken: token });
});

// POST /api/auth/logout
router.post("/logout", async (req: Request, res: Response) => {
  const token = req.headers["x-session-token"] as string;
  if (token) {
    await db
      .update(sessionsTable)
      .set({ isActive: false })
      .where(eq(sessionsTable.token, token));
  }
  return res.json({ success: true, message: null });
});

// GET /api/auth/me
router.get("/me", async (req: Request, res: Response) => {
  const token = req.headers["x-session-token"] as string;
  const user = await getUserFromToken(token);
  if (!user) {
    return res.status(401).json({ error: "غير مصادق" });
  }
  const session = await db
    .select()
    .from(sessionsTable)
    .where(and(eq(sessionsTable.token, token), eq(sessionsTable.isActive, true)))
    .limit(1);
  if (!session[0]) {
    return res.status(401).json({ error: "انتهت الجلسة" });
  }
  return res.json({ userId: user.id, email: user.email, sessionToken: token });
});

export { router as authRouter, getUserFromToken };
