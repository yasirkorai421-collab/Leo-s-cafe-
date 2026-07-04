/**
 * Script to create admin user in Supabase
 * Run with: npx tsx scripts/create-admin.ts
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables!');
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createAdminUser() {
  console.log('🚀 Creating admin user...\n');

  const adminEmail = 'admin@leoscafe.com';
  const adminPassword = 'Leo@Admin2026';

  try {
    // Create the admin user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: {
        full_name: 'Admin User',
        role: 'admin',
        birthday: '1990-01-01'
      }
    });

    if (authError) {
      if (authError.message.includes('already registered')) {
        console.log('⚠️  Admin user already exists');
        console.log('📧 Email:', adminEmail);
        console.log('\n💡 To update the role, go to Supabase Dashboard:');
        console.log('   1. Authentication → Users');
        console.log('   2. Find:', adminEmail);
        console.log('   3. Edit User Metadata to include: { "role": "admin" }');
        return;
      }
      throw authError;
    }

    console.log('✅ Admin user created successfully!');
    console.log('\n📋 Admin Credentials:');
    console.log('━'.repeat(50));
    console.log('Email:    ', adminEmail);
    console.log('Password: ', adminPassword);
    console.log('User ID:  ', authData.user.id);
    console.log('━'.repeat(50));
    console.log('\n🔐 Security Reminder:');
    console.log('   - Change the password after first login');
    console.log('   - Enable MFA in Supabase dashboard');
    console.log('   - Never commit credentials to git');
    console.log('\n🌐 Access the admin panel at:');
    console.log('   http://localhost:3001/admin');
    console.log('');

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    process.exit(1);
  }
}

createAdminUser();
