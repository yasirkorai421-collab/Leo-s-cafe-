import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
prisma.menuItem.findMany().then(items => {
  console.log(items.length, 'items in DB');
  if (items.length > 0) {
    console.log('Sample item:', items[0].id, items[0].name);
  }
}).catch(e => console.error(e)).finally(() => prisma.$disconnect());
