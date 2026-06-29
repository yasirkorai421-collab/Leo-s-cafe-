/**
 * PATCH /api/admin/tables/[id] - Update table (rotate QR, toggle active)
 * DELETE /api/admin/tables/[id] - Delete table
 * Epic 6 - Admin table management
 */

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/ownership";
import { prisma } from "@/lib/prisma";
import { generateQRToken } from "@/lib/qrToken";
import { z } from "zod";

const updateTableSchema = z.object({
  label: z.string().min(1).optional(),
  isActive: z.boolean().optional(),
  rotateQR: z.boolean().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    const { id } = await params;

    const body = await request.json();
    const validation = updateTableSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error },
        { status: 400 }
      );
    }

    const { label, isActive, rotateQR } = validation.data;

    const table = await prisma.table.findUnique({ where: { id } });
    if (!table) {
      return NextResponse.json({ error: "Table not found" }, { status: 404 });
    }

    let qrToken = table.qrToken;
    let qrVersion = table.qrVersion;

    // Rotate QR version (invalidates old QR codes)
    if (rotateQR) {
      qrVersion = table.qrVersion + 1;
      qrToken = generateQRToken(table.id, qrVersion);

      // Close all active sessions on QR rotation
      await prisma.tableSession.updateMany({
        where: {
          tableId: id,
          status: "active",
        },
        data: {
          status: "expired",
        },
      });
    }

    const updatedTable = await prisma.table.update({
      where: { id },
      data: {
        ...(label && { label }),
        ...(typeof isActive === "boolean" && { isActive }),
        ...(rotateQR && { qrVersion, qrToken }),
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: admin.userId,
        action: rotateQR ? "TABLE_QR_ROTATED" : "TABLE_UPDATED",
        entityType: "table",
        entityId: id,
        details: { label, isActive, rotateQR },
      },
    });

    return NextResponse.json({ table: updatedTable });
  } catch (error: any) {
    console.error("Update table error:", error);

    if (error.message === "UNAUTHORIZED" || error.message === "NOT_FOUND") {
      return NextResponse.json({ error: "Not Found" }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Failed to update table" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    const { id } = await params;

    await prisma.table.delete({ where: { id } });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: admin.userId,
        action: "TABLE_DELETED",
        entityType: "table",
        entityId: id,
        details: {},
      },
    });

    return NextResponse.json({ message: "Table deleted" });
  } catch (error: any) {
    console.error("Delete table error:", error);

    if (error.message === "UNAUTHORIZED" || error.message === "NOT_FOUND") {
      return NextResponse.json({ error: "Not Found" }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Failed to delete table" },
      { status: 500 }
    );
  }
}
