import { NextRequest, NextResponse } from "next/server";
import { getSessionId, setSessionCookie } from "@/lib/session";
import { createOrder, listOrders } from "@/lib/store";
import { PLANS, type PlanKey } from "@/types/plan";

export async function GET() {
  try {
    const sessionId = await getSessionId();
    const orders = await listOrders(sessionId);

    const response = NextResponse.json({ orders });
    response.headers.set("Set-Cookie", setSessionCookie(sessionId));
    return response;
  } catch (error) {
    console.error("查询订单失败:", error);
    return NextResponse.json({ error: "查询失败" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { plan } = await request.json();

    if (!plan || !PLANS[plan as PlanKey]) {
      return NextResponse.json({ error: "无效的套餐" }, { status: 400 });
    }

    const sessionId = await getSessionId();
    const order = await createOrder(sessionId, plan as PlanKey);

    // TODO: 实际支付平台对接后，生成支付链接
    const payUrl = `/pay/${order.id}`;

    const response = NextResponse.json({
      orderId: order.id,
      payUrl,
      plan: PLANS[plan as PlanKey],
    });
    response.headers.set("Set-Cookie", setSessionCookie(sessionId));
    return response;
  } catch (error) {
    console.error("创建订单失败:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "创建订单失败" },
      { status: 500 }
    );
  }
}
