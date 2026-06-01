import fs from "fs/promises";
import path from "path";
import { PLANS, FREE_CREDITS, type PlanKey } from "@/types/plan";

const DATA_DIR = path.join(process.cwd(), "data");

interface UserData {
  sessionId: string;
  freeUsed: number;
  paidCredits: number;
  createdAt: number;
}

interface OrderData {
  id: string;
  sessionId: string;
  plan: PlanKey;
  amount: number;
  credits: number;
  status: "pending" | "paid" | "failed";
  createdAt: number;
  paidAt?: number;
}

async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

function userFilePath(sessionId: string): string {
  return path.join(DATA_DIR, `user-${sessionId}.json`);
}

function orderFilePath(orderId: string): string {
  return path.join(DATA_DIR, `order-${orderId}.json`);
}

async function readJSON<T>(filePath: string): Promise<T | null> {
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

async function writeJSON<T>(filePath: string, data: T): Promise<void> {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
}

export async function getUser(sessionId: string): Promise<UserData> {
  await ensureDataDir();
  const existing = await readJSON<UserData>(userFilePath(sessionId));
  if (existing) {
    return existing;
  }
  const user: UserData = {
    sessionId,
    freeUsed: 0,
    paidCredits: 0,
    createdAt: Date.now(),
  };
  await writeJSON(userFilePath(sessionId), user);
  return user;
}

export async function checkQuota(sessionId: string): Promise<{ available: boolean; freeRemaining: number; paidCredits: number; totalRemaining: number }> {
  const user = await getUser(sessionId);
  const freeRemaining = Math.max(0, FREE_CREDITS - user.freeUsed);
  const totalRemaining = freeRemaining + user.paidCredits;
  return {
    available: totalRemaining > 0,
    freeRemaining,
    paidCredits: user.paidCredits,
    totalRemaining,
  };
}

export async function consumeQuota(sessionId: string): Promise<{ freeRemaining: number; paidCredits: number; totalRemaining: number }> {
  const user = await getUser(sessionId);
  const freeRemaining = Math.max(0, FREE_CREDITS - user.freeUsed);

  if (freeRemaining > 0) {
    user.freeUsed += 1;
  } else if (user.paidCredits > 0) {
    user.paidCredits -= 1;
  } else {
    throw new Error("QUOTA_EXCEEDED");
  }

  await writeJSON(userFilePath(sessionId), user);
  const newFreeRemaining = Math.max(0, FREE_CREDITS - user.freeUsed);
  return {
    freeRemaining: newFreeRemaining,
    paidCredits: user.paidCredits,
    totalRemaining: newFreeRemaining + user.paidCredits,
  };
}

export async function addCredits(sessionId: string, credits: number): Promise<void> {
  const user = await getUser(sessionId);
  user.paidCredits += credits;
  await writeJSON(userFilePath(sessionId), user);
}

export async function createOrder(sessionId: string, plan: PlanKey): Promise<OrderData> {
  await ensureDataDir();
  const planInfo = PLANS[plan];
  const order: OrderData = {
    id: `order-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    sessionId,
    plan,
    amount: planInfo.price,
    credits: planInfo.credits,
    status: "pending",
    createdAt: Date.now(),
  };
  await writeJSON(orderFilePath(order.id), order);
  return order;
}

export async function updateOrder(orderId: string, status: "paid" | "failed"): Promise<OrderData | null> {
  const order = await readJSON<OrderData>(orderFilePath(orderId));
  if (!order) return null;
  order.status = status;
  if (status === "paid") {
    order.paidAt = Date.now();
  }
  await writeJSON(orderFilePath(orderId), order);
  return order;
}

export async function getOrder(orderId: string): Promise<OrderData | null> {
  return readJSON<OrderData>(orderFilePath(orderId));
}

export async function listOrders(sessionId: string): Promise<OrderData[]> {
  await ensureDataDir();
  const files = await fs.readdir(DATA_DIR);
  const orders: OrderData[] = [];
  for (const file of files) {
    if (file.startsWith("order-") && file.endsWith(".json")) {
      const order = await readJSON<OrderData>(path.join(DATA_DIR, file));
      if (order && order.sessionId === sessionId) {
        orders.push(order);
      }
    }
  }
  return orders.sort((a, b) => b.createdAt - a.createdAt);
}
