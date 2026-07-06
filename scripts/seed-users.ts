/**
 * Master User Seeding Script
 * Seeds admin and delivery personnel from environment variables
 * Run: npm run seed:users
 */

import { seedAdminUser } from "../lib/seed-admin";
import { seedDeliveryPersonnel } from "../lib/seed-delivery";

async function main() {
  console.log("🌱 Starting user seeding process...\n");
  console.log("=" .repeat(50));

  // Seed admin user
  console.log("\n👑 ADMIN USER");
  console.log("=".repeat(50));
  const adminSuccess = await seedAdminUser();

  // Seed delivery personnel
  console.log("\n🚚 DELIVERY PERSONNEL");
  console.log("=".repeat(50));
  const deliverySuccess = await seedDeliveryPersonnel();

  console.log("\n" + "=".repeat(50));
  
  if (adminSuccess && deliverySuccess) {
    console.log("✅ All users seeded successfully!");
    console.log("\n📝 Next steps:");
    console.log("1. Admin can login at /admin/login with configured credentials");
    console.log("2. Delivery personnel can login at /delivery/login");
    console.log("3. Admin can manage delivery personnel from /admin/delivery-personnel");
  } else {
    console.log("⚠️  Some users failed to seed. Check errors above.");
    process.exit(1);
  }
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Fatal error:", error);
    process.exit(1);
  });
