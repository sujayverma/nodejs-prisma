import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();


async function main() {
    const users = [];
    const staticPassword = 'password';
    const hashedPassword = await bcrypt.hash(staticPassword, 10);
    for (let i = 0; i < 10; i++) {
        users.push(
          await prisma.user.create({
            data: {
              name: faker.person.fullName(),
              email: faker.internet.email(),
              password: hashedPassword, // Save the hashed password
            },
          })
        );
    }

    console.log('Seeded Users:', users.length);

    const items = [];
    for (let i = 0; i < 20; i++) {
        items.push(
            await prisma.item.create({
                data: {
                productName: faker.commerce.productName(),
                productValue: parseFloat(faker.commerce.price()),
                },
            })
        );
    }

    console.log('Seeded Items:', items.length);


    for (let i = 0; i < 15; i++) {
        const randomUser = users[Math.floor(Math.random() * users.length)];
        const randomItems = faker.helpers.arrayElements(items, faker.number.int({ min: 1, max: 5 }));

        await prisma.order.create({
            data: {
              shippingAddress: faker.location.streetAddress(),
              status: faker.helpers.arrayElement(['Pending', 'Shipped', 'Delivered', 'Cancelled']),
              userId: randomUser.id,
              items: {
                create: randomItems.map(item => ({
                  item: {
                    connect: { id: item.id },
                  },
                })),
              },
            },
          });
    }

    console.log('Seeded Orders with Items');

    

}

main().catch(e => {
    console.error(e);
    process.exit(1);
})
.finally(async () => {
    await prisma.$disconnect();
});