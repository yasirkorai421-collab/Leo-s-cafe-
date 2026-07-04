import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/utils/supabase/server';
import prisma from '@/lib/prisma';

// PATCH - Update user
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const { name, role, loyaltyPoints, birthday } = body;

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: {
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

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

// DELETE - Delete user
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Prevent deleting yourself
    if (user.email) {
      const targetUser = await prisma.user.findUnique({
        where: { id: params.id },
        select: { email: true },
      });

      if (targetUser?.email === user.email) {
        return NextResponse.json(
          { error: 'Cannot delete your own account' },
          { status: 400 }
        );
      }
    }

    // Delete user
    await prisma.user.delete({
      where: { id: params.id },
    });

    // Try to delete from Supabase Auth too
    try {
      const targetUser = await prisma.user.findUnique({
        where: { id: params.id },
        select: { email: true },
      });
      
      if (targetUser) {
        const { data: authUsers } = await supabase.auth.admin.listUsers();
        const authUser = authUsers.users.find(u => u.email === targetUser.email);
        
        if (authUser) {
          await supabase.auth.admin.deleteUser(authUser.id);
        }
      }
    } catch (supabaseError) {
      console.warn('Failed to delete Supabase auth user:', supabaseError);
      // Continue anyway - user is deleted from database
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}
