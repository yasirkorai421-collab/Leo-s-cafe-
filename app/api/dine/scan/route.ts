/**
 * POST /api/dine/scan
 * Epic 6 - Scan QR and create table session
 * CLAUDE.md rules 4, 10, 12: One active session per table, transaction-wrapped, DB constraint
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyQRToken } from "@/lib/qrToken";
import { z } from "zod";

const scanSchema = z.object({
  token: z.string(),
});

const SESSION_DURATION_HOURS = 3;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = scanSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const { token } = validation.data;

    // CLAUDE.md: Verify signature BEFORE any database lookup
    const payload = verifyQRToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: "Invalid or expired QR token" },
        { status: 401 }
      );
    }

    // CLAUDE.md rule 10 + 12: Transaction with DB-level unique constraint
    const result = await prisma.$transaction(async (tx) => {
      // Verify table exists and is active
      const table = await tx.table.findUnique({
        where: { id: payload.tableId },
      });

      if (!table || !table.isActive) {
        throw new Error("TABLE_NOT_ACTIVE");
      }

      // Verify QR version matches (token not rotated)
      if (table.qrVersion !== payload.qrVersion) {
        throw new Error("QR_VERSION_MISMATCH");
      }

      // Check for existing active session (CLAUDE.md rule 4)
      // Note: The DB constraint makes this race-proof
      const existingSession = await tx.tableSession.findFirst({
        where: {
          tableId: payload.tableId,
          status: "active",
        },
      });

      if (existingSession) {
        throw new Error("SESSION_ALREADY_EXISTS");
      }

      // Create new session
      const sessionToken = crypto.randomUUID();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + SESSION_DURATION_HOURS);

      const session = await tx.tableSession.create({
        data: {
          tableId: payload.tableId,
          sessionToken,
          status: "active",
          expiresAt,
        },
      });

      return { session, table };
    });

    // Set httpOnly, secure, SameSite cookie (CLAUDE.md rule 4)
    const response = NextResponse.json({
      message: "Session created",
      tableLabel: result.table.label,
      expiresAt: result.session.expiresAt,
    });

    response.cookies.set("dine_session", result.session.sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: SESSION_DURATION_HOURS * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("QR scan error:", error);

    if (error.message === "TABLE_NOT_ACTIVE") {
      return NextResponse.json(
        { error: "Table is not available" },
        { status: 404 }
      );
    }

    if (error.message === "QR_VERSION_MISMATCH") {
      return NextResponse.json(
        { error: "QR code has been rotated. Please scan the new code." },
        { status: 401 }
      );
    }

    if (error.message === "SESSION_ALREADY_EXISTS") {
      return NextResponse.json(
        { error: "This table already has an active session" },
        { status: 409 }
      );
    }

    // Handle DB unique constraint violation (race condition)
    if (error.code === "P2002" || error.message.includes("unique_active_session")) {
      return NextResponse.json(
        { error: "This table already has an active session" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create session" },
      { status: 500 }
    );
  }
}
