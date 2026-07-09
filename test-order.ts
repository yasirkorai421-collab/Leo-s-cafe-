import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst();
  if (!user) {
    console.log("No user found");
    return;
  }
  
  const menuItem = await prisma.menuItem.findFirst();
  if (!menuItem) {
    console.log("No menu items");
    return;
  }

  try {
    const orderItems = [{
      item: { connect: { id: menuItem.id } },
      quantity: 1,
      customization: {},
      itemPrice: menuItem.price,
    }];

    const order = await prisma.order.create({
      data: {
        userId: user.id,
        status: "pending_payment",
        paymentStatus: "pending",
        total: 100,
        deliveryAddress: "Test Address",
        orderItems: {
          create: orderItems,
        },
      },
    });
    console.log("Order created:", order.id);
  } catch (e) {
    console.error("Failed to create order:", e);
  } finally {
    await prisma.$disconnect();
  }
}
main();
