/**
 * POST /api/profile/update-phone
 * Update user's phone number
 */

import { NextResponse } from 'next/server';
import { createServerClient } from '@/utils/supabase/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updatePhoneSchema = z.object({
  phone: z.string().regex(/^\+92\d{10}$/, 'Invalid Pakistani phone number'),
});

export async function POST(req: Request) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validation = updatePhoneSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid phone number format' },
        { status: 400 }
      );
    }

    const { phone } = validation.data;

    // Check if phone already exists
    const existing = await prisma.user.findFirst({
      where: {
        phone,
        id: { not: user.id },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Phone number already in use' },
        { status: 409 }
      );
    }

    // Update phone number
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { phone },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        phone: updatedUser.phone,
      },
    });
  } catch (error) {
    console.error('Phone update error:', error);
    return NextResponse.json(
      { error: 'Failed to update phone number' },
      { status: 500 }
    );
  }
}
