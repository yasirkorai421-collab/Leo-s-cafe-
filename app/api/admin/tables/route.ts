/**
 * GET /api/admin/tables - List all tables
 * POST /api/admin/tables - Create new table
 * Epic 6 - Admin table management
 */

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/ownership";
import { prisma } from "@/lib/prisma";
import { generateQRToken } from "@/lib/qrToken";
import { z } from "zod";

const createTableSchema = z.object({
  label: z.string().min(1),
});

export async function GET(request: Request) {
  try {
    await requireAdmin();

    const tables = await prisma.table.findMany({
      include: {
        sessions: {
          where: { status: "active" },
          include: {
            orders: {
              select: { id: true, total: true, status: true },
            },
          },
        },
      },
      orderBy: { label: "asc" },
    });

    return NextResponse.json({ tables });
  } catch (error: any) {
    console.error("Fetch tables error:", error);

    if (error.message === "UNAUTHORIZED" || error.message === "NOT_FOUND") {
      return NextResponse.json({ error: "Not Found" }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Failed to fetch tables" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdmin();

    const body = await request.json();
    const validation = createTableSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error },
        { status: 400 }
      );
    }

    const { label } = validation.data;

    const table = await prisma.table.create({
      data: {
        label,
        qrVersion: 1,
        qrToken: "", // Will be updated with actual token
      },
    });

    // Generate QR token
    const qrToken = generateQRToken(table.id, table.qrVersion);

    // Update table with token
    const updatedTable = await prisma.table.update({
      where: { id: table.id },
      data: { qrToken },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: admin.userId,
        action: "TABLE_CREATED",
        entityType: "table",
        entityId: table.id,
        details: { label },
      },
    });

    return NextResponse.json({ table: updatedTable });
  } catch (error: any) {
    console.error("Create table error:", error);

    if (error.message === "UNAUTHORIZED" || error.message === "NOT_FOUND") {
      return NextResponse.json({ error: "Not Found" }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Failed to create table" },
      { status: 500 }
    );
  }
}
