import { NextRequest, NextResponse } from "next/server";
import { updateOrder, getOrder, addCredits } from "@/lib/store";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, status, signature } = body;

    if (!orderId || !status) {
      return NextResponse.json({ error: "缺少参数" }, { status: 400 });
    }

    // TODO: 验证支付平台签名
    // if (!verifySignature(body, signature)) {
    //   return NextResponse.json({ error: "签名验证失败" }, { status: 401 });
    // }

    if (status !== "paid" && status !== "failed") {
      return NextResponse.json({ error: "无效状态" }, { status: 400 });
    }

    const order = await getOrder(orderId);
    if (!order) {
      return NextResponse.json({ error: "订单不存在" }, { status: 404 });
    }

    if (order.status !== "pending") {
      return NextResponse.json({ message: "订单已处理" });
    }

    const updated = await updateOrder(orderId, status);
    if (!updated) {
      return NextResponse.json({ error: "更新失败" }, { status: 500 });
    }

    if (status === "paid") {
      await addCredits(order.sessionId, order.credits);
    }

    return NextResponse.json({ message: "处理成功" });
  } catch (error) {
    console.error("Webhook 处理失败:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "处理失败" },
      { status: 500 }
    );
  }
}
