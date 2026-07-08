/**
 * POST /api/orders/place
 * Place a new order - triggers WhatsApp confirmation if phone not verified
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const placeOrderSchema = z.object({
  items: z.array(z.object({
    id: z.string(),
    name: z.string(),
    price: z.number(),
    quantity: z.number(),
    customization: z.any().optional(),
  })),
  totalPrice: z.number().positive(),
  deliveryAddress: z.string().optional(),
  customerNotes: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check email verification
    const { data: { user: authUser } } = await supabase.auth.admin.getUserById(user.id);
    if (!authUser?.email_confirmed_at) {
      return NextResponse.json(
        { error: 'Please verify your email first' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await req.json();
    const validation = placeOrderSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid order data', details: validation.error }, { status: 400 });
    }

    const { items, totalPrice, deliveryAddress, customerNotes } = validation.data;

    // Get user profile to check phone verification
    const userProfile = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        name: true,
        phone: true,
        phoneVerified: true,
      },
    });

    if (!userProfile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    // Create order with order items
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        total: parseFloat(totalPrice.toString()),
        status: userProfile.phoneVerified ? 'confirmed' : 'pending_whatsapp_confirmation',
        deliveryAddress,
        customerNotes,
        orderItems: {
          create: items.map((item) => ({
            itemId: item.id,
            quantity: item.quantity,
            itemPrice: item.price,
            customization: item.customization || null,
          })),
        },
      },
      include: {
        orderItems: {
          include: {
            item: true,
          },
        },
      },
    });

    // If phone not verified, trigger WhatsApp confirmation
    if (!userProfile.phoneVerified && userProfile.phone) {
      try {
        const whatsappServerUrl = process.env.WHATSAPP_SERVER_URL || 'http://localhost:3001';
        
        const confirmationResponse = await fetch(`${whatsappServerUrl}/send-confirmation`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: order.id,
            customerPhone: userProfile.phone,
            customerName: userProfile.name,
            orderItems: items,
            totalPrice,
          }),
        });

        if (!confirmationResponse.ok) {
          console.error('WhatsApp confirmation failed:', await confirmationResponse.text());
          // Continue anyway - order is created
        } else {
          console.log(`WhatsApp confirmation triggered for order ${order.id}`);
        }
      } catch (error) {
        console.error('Error sending WhatsApp confirmation:', error);
        // Continue anyway - order is created
      }
    }

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        status: order.status,
        total: order.total,
        needsWhatsAppConfirmation: !userProfile.phoneVerified,
        items: order.orderItems.map((oi) => ({
          id: oi.itemId,
          name: oi.item.name,
          quantity: oi.quantity,
          price: oi.itemPrice,
        })),
      },
    });
  } catch (error) {
    console.error('Order placement error:', error);
    return NextResponse.json(
      { error: 'Failed to place order' },
      { status: 500 }
    );
  }
}
