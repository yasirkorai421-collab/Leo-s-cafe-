/**
 * Admin User Seeding
 * Creates or updates the admin user based on environment variables
 * Should be run during deployment or manually via script
 */

import { prisma } from "./prisma";
import { createClient } from "@supabase/supabase-js";

export async function seedAdminUser() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminPhone = process.env.ADMIN_PHONE;
  const adminName = process.env.ADMIN_NAME || "Admin";

  if (!adminEmail || !adminPassword || !adminPhone) {
    console.error("❌ Admin credentials not found in environment variables");
    console.error("Required: ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_PHONE");
    return false;
  }

  try {
    // Create Supabase admin client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("❌ Supabase configuration missing");
      return false;
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    console.log("🔧 Checking for existing admin user...");

    // Check if admin already exists in Supabase
    const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error("❌ Error listing users:", listError);
      return false;
    }

    const existingAdmin = existingUsers?.users.find((u: any) => u.email === adminEmail || u.phone === adminPhone);

    let supabaseUserId: string;

    if (existingAdmin) {
      console.log("✓ Admin user already exists in Supabase:", existingAdmin.id);
      supabaseUserId = existingAdmin.id;

      // Update password if needed
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        supabaseUserId,
        { password: adminPassword }
      );

      if (updateError) {
        console.error("❌ Error updating admin password:", updateError);
      } else {
        console.log("✓ Admin password updated");
      }
    } else {
      console.log("📝 Creating new admin user in Supabase...");
      
      // Create admin user in Supabase
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: adminEmail,
        password: adminPassword,
        phone: adminPhone,
        email_confirm: true,
        phone_confirm: true,
        user_metadata: {
          name: adminName,
          role: "admin",
        },
      });

      if (createError || !newUser.user) {
        console.error("❌ Error creating admin user:", createError);
        return false;
      }

      supabaseUserId = newUser.user.id;
      console.log("✓ Admin user created in Supabase:", supabaseUserId);
    }

    // Create or update admin user in database
    const dbUser = await prisma.user.upsert({
      where: { clerkId: supabaseUserId },
      update: {
        name: adminName,
        email: adminEmail,
        phone: adminPhone,
        role: "admin",
        phoneVerifiedAt: new Date(),
      },
      create: {
        clerkId: supabaseUserId,
        name: adminName,
        email: adminEmail,
        phone: adminPhone,
        role: "admin",
        phoneVerifiedAt: new Date(),
      },
    });

    console.log("✓ Admin user in database:", dbUser.id);
    console.log("\n✅ Admin user seeding complete!");
    console.log(`📧 Email: ${adminEmail}`);
    console.log(`📱 Phone: ${adminPhone}`);
    console.log(`👤 Name: ${adminName}`);
    
    return true;
  } catch (error) {
    console.error("❌ Error seeding admin user:", error);
    return false;
  }
}

// Allow running this script directly
if (require.main === module) {
  seedAdminUser()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error("Fatal error:", error);
      process.exit(1);
    });
}
