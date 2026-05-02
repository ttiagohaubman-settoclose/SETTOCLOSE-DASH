import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import { authOptions } from "@/lib/auth";
import { redisGet, redisSet, redisDel, redisKeys } from "@/lib/redis";
import type { User } from "@/types";

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "admin") return null;
  return session;
}

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const keys = await redisKeys("users:*");
  const users: Omit<User, "passwordHash">[] = [];

  for (const key of keys) {
    const user = await redisGet<User>(key);
    if (user) {
      const { passwordHash: _, ...safe } = user;
      users.push(safe);
    }
  }

  return NextResponse.json(users);
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body: { email: string; password: string; clientId?: string } = await req.json();
  if (!body.email || !body.password) {
    return NextResponse.json({ error: "email and password are required" }, { status: 400 });
  }

  const email = body.email.toLowerCase().trim();
  const existing = await redisGet<User>(`users:${email}`);
  if (existing) {
    return NextResponse.json({ error: "User already exists" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(body.password, 10);
  const user: User = {
    id: generateId(),
    email,
    passwordHash,
    role: "client",
    clientId: body.clientId,
    createdAt: new Date().toISOString(),
  };

  await redisSet(`users:${email}`, user);
  const { passwordHash: _, ...safe } = user;
  return NextResponse.json(safe, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");
  if (!email) return NextResponse.json({ error: "email is required" }, { status: 400 });

  await redisDel(`users:${email.toLowerCase().trim()}`);
  return NextResponse.json({ success: true });
}
