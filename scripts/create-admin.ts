/**
 * Script to create admin user in Supabase
 * Run with: npx tsx scripts/create-admin.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

import { createClient } from '@supabase/supabase-js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔐 Creating Admin User...\n');

  // Initialize Supabase Admin Client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase credentials. Check your .env.local file.');
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  const adminEmail = 'admin@leoscafe.com';
  const adminPassword = 'LeosCafe2026!Admin';
  const adminName = 'Leo\'s Café Admin';
  const adminPhone = '+923361171626';

  console.log('Step 1: Creating Supabase Auth User...');
  
  // Create user in Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: adminEmail,
    password: adminPassword,
    email_confirm: true, // Auto-confirm email
    user_metadata: {
      full_name: adminName,
      phone: adminPhone,
    }
  });

  if (authError) {
    if (authError.message.includes('already registered')) {
      console.log('⚠️  User already exists in Supabase Auth');
      
      // Get the existing user
      const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
      if (listError) throw listError;
      
      const existingUser = users.find(u => u.email === adminEmail);
      if (!existingUser) throw new Error('User exists but could not be found');
      
      var userId = existingUser.id;
      console.log(`✓ Found existing user: ${userId}`);
    } else {
      throw authError;
    }
  } else {
    var userId = authData.user.id;
    console.log(`✓ Created Supabase Auth user: ${userId}`);
  }

  console.log('\nStep 2: Creating/Updating Database User...');
  
  // Create or update user in database
  const dbUser = await prisma.user.upsert({
    where: { clerkId: userId },
    update: {
      role: 'admin',
      name: adminName,
      email: adminEmail,
      phone: adminPhone,
    },
    create: {
      clerkId: userId,
      name: adminName,
      email: adminEmail,
      phone: adminPhone,
      role: 'admin',
    },
  });

  console.log(`✓ Database user created/updated: ${dbUser.id}`);
  console.log(`✓ Role set to: ${dbUser.role}`);

  console.log('\n✅ SUCCESS! Admin user is ready!\n');
  console.log('━'.repeat(60));
  console.log('📋 LOGIN CREDENTIALS');
  console.log('━'.repeat(60));
  console.log(`Email:    ${adminEmail}`);
  console.log(`Password: ${adminPassword}`);
  console.log('━'.repeat(60));
  console.log('\n🌐 LOGIN URL: http://localhost:3000/auth/login\n');
  console.log('✨ You can now login with these credentials!\n');
}

main()
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
