import { NextRequest, NextResponse } from "next/server";
import { createOrder, listOrders } from "@/lib/store";
import { PLANS, type PlanKey } from "@/types/plan";

export async function POST(request: NextRequest) {
  try {
    const { plan, fingerprint } = await request.json();

    if (!plan || !PLANS[plan as PlanKey]) {
      return NextResponse.json({ error: "无效的套餐" }, { status: 400 });
    }

    if (!fingerprint) {
      return NextResponse.json({ error: "用户标识缺失" }, { status: 400 });
    }

    const order = await createOrder(fingerprint, plan as PlanKey);

    // TODO: 实际支付平台对接后，生成支付链接
    const payUrl = `/pay/${order.id}`;

    return NextResponse.json({
      orderId: order.id,
      payUrl,
      plan: PLANS[plan as PlanKey],
    });
  } catch (error) {
    console.error("创建订单失败:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "创建订单失败" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fingerprint = searchParams.get("fingerprint");

    if (!fingerprint) {
      return NextResponse.json({ error: "用户标识缺失" }, { status: 400 });
    }

    const orders = await listOrders(fingerprint);

    return NextResponse.json({ orders });
  } catch (error) {
    console.error("查询订单失败:", error);
    return NextResponse.json({ error: "查询失败" }, { status: 500 });
  }
}
