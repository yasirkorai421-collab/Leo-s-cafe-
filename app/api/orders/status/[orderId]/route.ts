/**
 * GET /api/orders/status/[orderId]
 * Poll order status for real-time updates during WhatsApp confirmation
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: Request,
  { params }: { params: { orderId: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { orderId } = params;

    // Get order and verify ownership
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: {
          include: {
            item: true,
          },
        },
      },
    });

    if (!order || order.userId !== user.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: order.id,
      status: order.status,
      items: order.orderItems.map((oi) => ({
        id: oi.itemId,
        name: oi.item.name,
        quantity: oi.quantity,
        price: oi.itemPrice,
      })),
      totalPrice: order.total,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    });
  } catch (error) {
    console.error('Order status check error:', error);
    return NextResponse.json(
      { error: 'Failed to get order status' },
      { status: 500 }
    );
  }
}
