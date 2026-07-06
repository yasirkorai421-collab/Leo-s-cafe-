/**
 * Delivery Personnel Seeding
 * Creates or updates delivery personnel based on environment variables
 * Format: NAME|EMAIL|PASSWORD|PHONE separated by semicolons
 */

import { prisma } from "./prisma";
import { createClient } from "@supabase/supabase-js";

interface DeliveryPerson {
  name: string;
  email: string;
  password: string;
  phone: string;
}

function parseDeliveryPersonnel(): DeliveryPerson[] {
  const deliveryData = process.env.DELIVERY_PERSONNEL;
  
  if (!deliveryData) {
    return [];
  }

  try {
    return deliveryData.split(";").map((entry) => {
      const [name, email, password, phone] = entry.split("|").map((s) => s.trim());
      
      if (!name || !email || !password || !phone) {
        throw new Error(`Invalid delivery personnel entry: ${entry}`);
      }

      return { name, email, password, phone };
    });
  } catch (error) {
    console.error("❌ Error parsing DELIVERY_PERSONNEL:", error);
    return [];
  }
}

export async function seedDeliveryPersonnel() {
  const deliveryPersons = parseDeliveryPersonnel();

  if (deliveryPersons.length === 0) {
    console.log("ℹ️  No delivery personnel configured in environment");
    return true;
  }

  try {
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

    console.log(`🚚 Seeding ${deliveryPersons.length} delivery personnel...`);

    for (const person of deliveryPersons) {
      console.log(`\n📦 Processing: ${person.name} (${person.email})`);

      // Check if user exists
      const { data: existingUsers } = await supabase.auth.admin.listUsers();
      const existingUser = existingUsers?.users.find((u: any) => u.email === person.email);

      let supabaseUserId: string;

      if (existingUser) {
        console.log("  ✓ User exists in Supabase:", existingUser.id);
        supabaseUserId = existingUser.id;

        // Update password
        await supabase.auth.admin.updateUserById(supabaseUserId, {
          password: person.password,
        });
        console.log("  ✓ Password updated");
      } else {
        console.log("  📝 Creating new user in Supabase...");
        
        const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
          email: person.email,
          password: person.password,
          phone: person.phone,
          email_confirm: true,
          phone_confirm: true,
          user_metadata: {
            name: person.name,
            role: "delivery_person",
          },
        });

        if (createError || !newUser.user) {
          console.error("  ❌ Error creating user:", createError);
          continue;
        }

        supabaseUserId = newUser.user.id;
        console.log("  ✓ User created in Supabase:", supabaseUserId);
      }

      // Create or update in database
      const dbUser = await prisma.user.upsert({
        where: { clerkId: supabaseUserId },
        update: {
          name: person.name,
          email: person.email,
          phone: person.phone,
          role: "delivery_person",
          phoneVerifiedAt: new Date(),
        },
        create: {
          clerkId: supabaseUserId,
          name: person.name,
          email: person.email,
          phone: person.phone,
          role: "delivery_person",
          phoneVerifiedAt: new Date(),
        },
      });

      console.log("  ✓ Database record:", dbUser.id);
    }

    console.log("\n✅ Delivery personnel seeding complete!");
    return true;
  } catch (error) {
    console.error("❌ Error seeding delivery personnel:", error);
    return false;
  }
}

// Allow running this script directly
if (require.main === module) {
  seedDeliveryPersonnel()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error("Fatal error:", error);
      process.exit(1);
    });
}
