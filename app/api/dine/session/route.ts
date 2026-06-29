/**
 * GET /api/dine/session - Get current session info
 * DELETE /api/dine/session - Close session (customer checkout)
 * Epic 6 - Session management
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const sessionToken = request.headers.get("cookie")?.match(/dine_session=([^;]+)/)?.[1];

    if (!sessionToken) {
      return NextResponse.json({ session: null });
    }

    const session = await prisma.tableSession.findUnique({
      where: { sessionToken },
      include: {
        table: { select: { label: true } },
        orders: {
          include: {
            orderItems: {
              include: {
                item: { select: { name: true, price: true } },
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!session || session.status !== "active") {
      return NextResponse.json({ session: null });
    }

    return NextResponse.json({ session });
  } catch (error: any) {
    console.error("Get session error:", error);
    return NextResponse.json(
      { error: "Failed to get session" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const sessionToken = request.headers.get("cookie")?.match(/dine_session=([^;]+)/)?.[1];

    if (!sessionToken) {
      return NextResponse.json({ error: "No active session" }, { status: 401 });
    }

    // Close session
    await prisma.tableSession.update({
      where: { sessionToken },
      data: {
        status: "closed",
        closedAt: new Date(),
      },
    });

    // Clear cookie
    const response = NextResponse.json({ message: "Session closed" });
    response.cookies.delete("dine_session");

    return response;
  } catch (error: any) {
    console.error("Close session error:", error);
    return NextResponse.json(
      { error: "Failed to close session" },
      { status: 500 }
    );
  }
}
