import { Redis } from "@upstash/redis";
import { PLANS, FREE_CREDITS, type PlanKey } from "@/types/plan";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

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

function userKey(sessionId: string): string {
  return `user:${sessionId}`;
}

function orderKey(orderId: string): string {
  return `order:${orderId}`;
}

function userOrdersKey(sessionId: string): string {
  return `orders:${sessionId}`;
}

export async function getUser(sessionId: string): Promise<UserData> {
  const existing = await redis.get<UserData>(userKey(sessionId));
  if (existing) return existing;

  const user: UserData = {
    sessionId,
    freeUsed: 0,
    paidCredits: 0,
    createdAt: Date.now(),
  };

  await redis.set(userKey(sessionId), user);
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

  await redis.set(userKey(sessionId), user);
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
  await redis.set(userKey(sessionId), user);
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

  await redis.set(orderKey(order.id), order);
  // Add to user's order list
  await redis.sadd(userOrdersKey(sessionId), order.id);
  return order;
}

export async function updateOrder(orderId: string, status: "paid" | "failed"): Promise<OrderData | null> {
  const order = await redis.get<OrderData>(orderKey(orderId));
  if (!order) return null;

  order.status = status;
  if (status === "paid") {
    order.paidAt = Date.now();
  }

  await redis.set(orderKey(orderId), order);
  return order;
}

export async function getOrder(orderId: string): Promise<OrderData | null> {
  return redis.get<OrderData>(orderKey(orderId));
}

export async function listOrders(sessionId: string): Promise<OrderData[]> {
  const orderIds = await redis.smembers(userOrdersKey(sessionId));
  if (!orderIds || orderIds.length === 0) return [];

  const orders: OrderData[] = [];
  for (const id of orderIds) {
    const order = await redis.get<OrderData>(orderKey(id));
    if (order) orders.push(order);
  }
  return orders.sort((a, b) => b.createdAt - a.createdAt);
}
