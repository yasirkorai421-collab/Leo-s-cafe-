import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// GET - Fetch all users
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
      select: { role: true },
    });

    if (dbUser?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 });
    }

    // Fetch all users (exclude passwords)
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        loyaltyBalance: true,
        birthday: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

// POST - Create new user
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
      select: { role: true },
    });

    if (dbUser?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 });
    }

    const body = await request.json();
    const { phone, password, name, role, email, loyaltyPoints, birthday } = body;

    // Validate required fields
    if (!phone) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { phone },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this phone number already exists' },
        { status: 400 }
      );
    }

    // Create user in Supabase Auth first
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      phone,
      phone_confirm: true,
      user_metadata: { name: name || '' }
    });

    if (authError || !authData.user) {
      return NextResponse.json(
        { error: authError?.message || 'Failed to create auth user' },
        { status: 500 }
      );
    }

    // Create user in database
    const newUser = await prisma.user.create({
      data: {
        clerkId: authData.user.id,
        phone,
        email: email || null,
        name: name || 'User',
        role: role || 'user',
        loyaltyBalance: loyaltyPoints || 0,
        birthday: birthday || null,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        loyaltyBalance: true,
        birthday: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ user: newUser }, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}
