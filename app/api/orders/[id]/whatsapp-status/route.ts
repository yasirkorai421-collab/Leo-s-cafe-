/**
 * POST /api/orders/[id]/whatsapp-status
 * Update order status from WhatsApp server callback
 * Called by WhatsApp server when user confirms/cancels via WhatsApp
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const WHATSAPP_CALLBACK_SECRET = process.env.WHATSAPP_CALLBACK_SECRET;

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authorization
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    if (WHATSAPP_CALLBACK_SECRET && token !== WHATSAPP_CALLBACK_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body = await req.json();
    const { status } = body;

    if (!['confirmed', 'cancelled', 'expired'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    // Update order status
    const order = await prisma.order.update({
      where: { id },
      data: {
        status: status === 'confirmed' ? 'confirmed' : 'cancelled',
      },
    });

    // If confirmed, mark phone as verified
    if (status === 'confirmed') {
      await prisma.user.update({
        where: { id: order.userId },
        data: { phoneVerified: true },
      });
    }

    return NextResponse.json({
      success: true,
      message: `Order ${status}`,
      order,
    });
  } catch (error) {
    console.error('WhatsApp status update error:', error);
    return NextResponse.json(
      { error: 'Failed to update order status' },
      { status: 500 }
    );
  }
}
