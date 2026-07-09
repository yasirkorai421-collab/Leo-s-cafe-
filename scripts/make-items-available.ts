/**
 * Script to make all menu items available
 * Run with: npx tsx scripts/make-items-available.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Updating all menu items to be available...\n');

  const result = await prisma.menuItem.updateMany({
    where: {
      isActive: true,
    },
    data: {
      isAvailable: true,
    },
  });

  console.log(`✅ Updated ${result.count} menu items to be available\n`);

  // Show updated items
  const items = await prisma.menuItem.findMany({
    where: {
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      isAvailable: true,
      category: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      name: 'asc',
    },
  });

  console.log('📋 Available menu items:');
  console.log('─'.repeat(60));
  items.forEach((item) => {
    console.log(`✓ ${item.name} (${item.category.name}) - Available: ${item.isAvailable}`);
  });
  console.log('─'.repeat(60));
  console.log(`\n✨ Total active items: ${items.length}`);
}

main()
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
