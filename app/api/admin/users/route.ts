import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/utils/supabase/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// GET - Fetch all users
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const dbUser = await prisma.user.findUnique({
      where: { email: user.email! },
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
        loyaltyPoints: true,
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
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const dbUser = await prisma.user.findUnique({
      where: { email: user.email! },
      select: { role: true },
    });

    if (dbUser?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 });
    }

    const body = await request.json();
    const { email, password, name, role, loyaltyPoints, birthday } = body;

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user in database
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || null,
        role: role || 'customer',
        loyaltyPoints: loyaltyPoints || 0,
        birthday: birthday || null,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        loyaltyPoints: true,
        birthday: true,
        createdAt: true,
      },
    });

    // Also create in Supabase Auth (optional - for login capability)
    try {
      const supabaseAdmin = await createServerClient();
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { name: name || '' },
      });
    } catch (supabaseError) {
      console.warn('Failed to create Supabase auth user:', supabaseError);
      // Continue anyway - user is created in database
    }

    return NextResponse.json({ user: newUser }, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}
