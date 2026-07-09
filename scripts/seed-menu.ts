import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

import { PrismaClient } from '@prisma/client';
import { categories, menuItems } from '../lib/menu-data';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding menu...');
  
  // Create categories first
  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: {
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        imageUrl: cat.imageUrl,
        sortOrder: cat.sortOrder || 0,
      }
    });
  }
  
  console.log(`Seeded ${categories.length} categories.`);
  
  // Create menu items
  for (const item of menuItems) {
    await prisma.menuItem.upsert({
      where: { slug: item.slug },
      update: {},
      create: {
        id: item.id,
        categoryId: item.categoryId,
        name: item.name,
        slug: item.slug,
        description: item.description || '',
        price: item.price,
        imageUrl: item.imageUrl,
        isAvailable: item.isAvailable,
        isActive: item.isActive,
      }
    });
  }
  
  console.log(`Seeded ${menuItems.length} menu items.`);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
