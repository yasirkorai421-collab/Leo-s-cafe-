/**
 * Seed script to populate database with menu items
 * Run with: npx tsx scripts/seed-database.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...\n');

  // Create categories
  const categoryData = [
    { name: 'Pizzas', slug: 'pizzas', imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591', sortOrder: 1 },
    { name: 'Burgers & Rolls', slug: 'burgers-rolls', imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd', sortOrder: 2 },
    { name: 'Mains & Pasta', slug: 'mains-pasta', imageUrl: 'https://images.unsplash.com/photo-1645112411341-6c4fd023714a', sortOrder: 3 },
    { name: 'Drinks', slug: 'drinks', imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93', sortOrder: 4 },
    { name: 'Desserts', slug: 'desserts', imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c', sortOrder: 5 },
  ];

  console.log('📁 Creating categories...');
  const categories: any = {};
  for (const cat of categoryData) {
    const category = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        imageUrl: cat.imageUrl,
        sortOrder: cat.sortOrder,
        isActive: true,
      },
      create: cat,
    });
    categories[cat.slug] = category;
    console.log(`  ✓ ${cat.name}`);
  }

  // Create menu items
  console.log('\n🍕 Creating menu items...');
  
  const menuItems = [
    // Pizzas - with size variations
    { categorySlug: 'pizzas', name: "Leo's Special Pizza (Small)", slug: 'leos-special-pizza-small', description: 'House signature · Loaded', price: 300, imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=400' },
    { categorySlug: 'pizzas', name: "Leo's Special Pizza (Medium)", slug: 'leos-special-pizza-medium', description: 'House signature · Loaded', price: 650, imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=400' },
    { categorySlug: 'pizzas', name: "Leo's Special Pizza (Large)", slug: 'leos-special-pizza-large', description: 'House signature · Loaded', price: 850, imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=400' },
    
    { categorySlug: 'pizzas', name: 'Café Special Pizza (Small)', slug: 'cafe-special-pizza-small', description: 'Cheese, chicken & veg', price: 300, imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?q=80&w=400' },
    { categorySlug: 'pizzas', name: 'Café Special Pizza (Medium)', slug: 'cafe-special-pizza-medium', description: 'Cheese, chicken & veg', price: 650, imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?q=80&w=400' },
    { categorySlug: 'pizzas', name: 'Café Special Pizza (Large)', slug: 'cafe-special-pizza-large', description: 'Cheese, chicken & veg', price: 850, imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?q=80&w=400' },
    
    { categorySlug: 'pizzas', name: 'Malai Boti Pizza (Small)', slug: 'malai-boti-pizza-small', description: 'Creamy, mild spice', price: 300, imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=400' },
    { categorySlug: 'pizzas', name: 'Malai Boti Pizza (Medium)', slug: 'malai-boti-pizza-medium', description: 'Creamy, mild spice', price: 650, imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=400' },
    { categorySlug: 'pizzas', name: 'Malai Boti Pizza (Large)', slug: 'malai-boti-pizza-large', description: 'Creamy, mild spice', price: 850, imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=400' },
    
    { categorySlug: 'pizzas', name: 'Shahi Pizza (Small)', slug: 'shahi-pizza-small', description: 'Rich & royal-style topping', price: 300, imageUrl: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?q=80&w=400' },
    { categorySlug: 'pizzas', name: 'Shahi Pizza (Medium)', slug: 'shahi-pizza-medium', description: 'Rich & royal-style topping', price: 650, imageUrl: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?q=80&w=400' },
    { categorySlug: 'pizzas', name: 'Shahi Pizza (Large)', slug: 'shahi-pizza-large', description: 'Rich & royal-style topping', price: 850, imageUrl: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?q=80&w=400' },
    
    // Burgers & Rolls
    { categorySlug: 'burgers-rolls', name: 'Zinger Burger', slug: 'zinger-burger', description: 'Crispy fried chicken', price: 450, imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=400' },
    { categorySlug: 'burgers-rolls', name: 'Grilled Sandwich', slug: 'grilled-sandwich', description: 'Toasted & filled', price: 350, imageUrl: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?q=80&w=400' },
    { categorySlug: 'burgers-rolls', name: 'Chicken Shawarma', slug: 'chicken-shawarma', description: 'Wrapped & grilled', price: 250, imageUrl: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?q=80&w=400' },
    { categorySlug: 'burgers-rolls', name: 'Fries with Mayo Sauce', slug: 'fries-mayo', description: 'Golden & hot', price: 180, imageUrl: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?q=80&w=400' },
    
    // Mains & Pasta
    { categorySlug: 'mains-pasta', name: 'Chicken Alfredo Pasta', slug: 'chicken-alfredo', description: 'Creamy, rich sauce', price: 650, imageUrl: 'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?q=80&w=400' },
    { categorySlug: 'mains-pasta', name: 'Creamy Chicken Steak', slug: 'chicken-steak', description: 'Pan-seared, sauced', price: 750, imageUrl: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?q=80&w=400' },
    { categorySlug: 'mains-pasta', name: 'Grilled Chicken with Rice', slug: 'grilled-chicken-rice', description: 'Smoky & filling', price: 700, imageUrl: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?q=80&w=400' },
    
    // Drinks
    { categorySlug: 'drinks', name: 'Hot Coffee', slug: 'hot-coffee', description: 'Freshly brewed', price: 200, imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=400' },
    { categorySlug: 'drinks', name: 'Cold Coffee', slug: 'cold-coffee', description: 'Iced & refreshing', price: 250, imageUrl: 'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?q=80&w=400' },
    { categorySlug: 'drinks', name: 'Mint Margarita', slug: 'mint-margarita', description: 'Refreshing & minty', price: 180, imageUrl: 'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?q=80&w=400' },
    
    // Desserts
    { categorySlug: 'desserts', name: 'Molten Lava Cake', slug: 'lava-cake', description: 'Warm, gooey centre', price: 320, imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?q=80&w=400' },
    { categorySlug: 'desserts', name: 'Chocolate Brownie + Ice Cream', slug: 'brownie-ice-cream', description: 'Warm & cold together', price: 380, imageUrl: 'https://images.unsplash.com/photo-1564355808539-22fda35bed7e?q=80&w=400' },
  ];

  let count = 0;
  for (const item of menuItems) {
    const category = categories[item.categorySlug];
    await prisma.menuItem.upsert({
      where: { slug: item.slug },
      update: {
        name: item.name,
        description: item.description,
        price: item.price,
        imageUrl: item.imageUrl,
        isAvailable: true,  // ✨ Set all items as available
        isActive: true,
      },
      create: {
        categoryId: category.id,
        name: item.name,
        slug: item.slug,
        description: item.description,
        price: item.price,
        imageUrl: item.imageUrl,
        isAvailable: true,  // ✨ Set all items as available
        isActive: true,
      },
    });
    count++;
    console.log(`  ✓ ${item.name}`);
  }

  console.log(`\n✅ Successfully seeded ${categoryData.length} categories and ${count} menu items`);
  console.log('✨ All items are set as available and active!\n');
}

main()
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
