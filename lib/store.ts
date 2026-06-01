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

// In-memory cache for Vercel (file system not persistent)
const memoryCache = new Map<string, UserData>();

let fsAvailable: boolean | null = null;

async function checkFsAvailable(): Promise<boolean> {
  if (fsAvailable !== null) return fsAvailable;
  try {
    await fs.access(DATA_DIR);
    fsAvailable = true;
  } catch {
    try {
      await fs.mkdir(DATA_DIR, { recursive: true });
      fsAvailable = true;
    } catch {
      fsAvailable = false;
    }
  }
  return fsAvailable;
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
  // Try file storage first
  if (await checkFsAvailable()) {
    const existing = await readJSON<UserData>(userFilePath(sessionId));
    if (existing) return existing;
  }

  // Fall back to memory cache
  const cached = memoryCache.get(sessionId);
  if (cached) return cached;

  const user: UserData = {
    sessionId,
    freeUsed: 0,
    paidCredits: 0,
    createdAt: Date.now(),
  };

  // Try to persist to file
  if (await checkFsAvailable()) {
    try {
      await writeJSON(userFilePath(sessionId), user);
    } catch {
      // Ignore write errors
    }
  }

  // Always cache in memory
  memoryCache.set(sessionId, user);
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

  // Try to persist to file
  if (await checkFsAvailable()) {
    try {
      await writeJSON(userFilePath(sessionId), user);
    } catch {
      // Ignore write errors
    }
  }

  // Always update memory cache
  memoryCache.set(sessionId, user);

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

  if (await checkFsAvailable()) {
    try {
      await writeJSON(userFilePath(sessionId), user);
    } catch {
      // Ignore
    }
  }
  memoryCache.set(sessionId, user);
}

export async function createOrder(sessionId: string, plan: PlanKey): Promise<OrderData> {
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

  if (await checkFsAvailable()) {
    try {
      await writeJSON(orderFilePath(order.id), order);
    } catch {
      // Ignore
    }
  }
  return order;
}

export async function updateOrder(orderId: string, status: "paid" | "failed"): Promise<OrderData | null> {
  let order: OrderData | null = null;

  if (await checkFsAvailable()) {
    order = await readJSON<OrderData>(orderFilePath(orderId));
  }

  if (!order) return null;

  order.status = status;
  if (status === "paid") {
    order.paidAt = Date.now();
  }

  if (await checkFsAvailable()) {
    try {
      await writeJSON(orderFilePath(orderId), order);
    } catch {
      // Ignore
    }
  }
  return order;
}

export async function getOrder(orderId: string): Promise<OrderData | null> {
  if (await checkFsAvailable()) {
    return readJSON<OrderData>(orderFilePath(orderId));
  }
  return null;
}

export async function listOrders(sessionId: string): Promise<OrderData[]> {
  if (!(await checkFsAvailable())) {
    return [];
  }

  try {
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
  } catch {
    return [];
  }
}
