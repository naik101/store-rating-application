const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database with initial users, stores, and ratings...');

  // Clean existing data
  await prisma.rating.deleteMany();
  await prisma.store.deleteMany();
  await prisma.user.deleteMany();

  // Salt and hash passwords
  const adminPassword = await bcrypt.hash('Admin@12345', 10);
  const ownerPassword = await bcrypt.hash('Owner@12345', 10);
  const userPassword = await bcrypt.hash('User@12345', 10);

  // 1. Create System Administrator
  const admin = await prisma.user.create({
    data: {
      name: 'System Administrator Master',
      email: 'admin@storerating.com',
      password: adminPassword,
      address: '742 Evergreen Terrace, Springfield, OR 97477',
      role: 'ADMIN',
    },
  });

  // 2. Create Store Owners
  const owner1 = await prisma.user.create({
    data: {
      name: 'Store Owner Professional One',
      email: 'owner@storerating.com',
      password: ownerPassword,
      address: '100 Market Boulevard, Suite 400, San Francisco, CA 94105',
      role: 'STORE_OWNER',
    },
  });

  const owner2 = await prisma.user.create({
    data: {
      name: 'Premier Retail Operations Lead',
      email: 'owner2@storerating.com',
      password: ownerPassword,
      address: '250 Grand Avenue, Chicago, IL 60611',
      role: 'STORE_OWNER',
    },
  });

  // 3. Create Normal Users
  const user1 = await prisma.user.create({
    data: {
      name: 'Alice Johnson Smithfield',
      email: 'alice@storerating.com',
      password: userPassword,
      address: '123 Maple Street, Apt 4B, Seattle, WA 98101',
      role: 'USER',
    },
  });

  const user2 = await prisma.user.create({
    data: {
      name: 'Bob Christopher Martinez',
      email: 'bob@storerating.com',
      password: userPassword,
      address: '456 Oak Avenue, Denver, CO 80202',
      role: 'USER',
    },
  });

  // 4. Create Stores
  const store1 = await prisma.store.create({
    data: {
      name: 'Apex Electronics Superstore',
      email: 'contact@apexelectronics.com',
      address: '1200 Tech Highway, Silicon Valley, CA 94025',
      ownerId: owner1.id,
    },
  });

  const store2 = await prisma.store.create({
    data: {
      name: 'Gourmet Artisan Coffee Roasters',
      email: 'hello@gourmetcoffeeroasters.com',
      address: '45 Heritage Square, Portland, OR 97201',
      ownerId: owner2.id,
    },
  });

  const store3 = await prisma.store.create({
    data: {
      name: 'Metro Books and Stationery Haven',
      email: 'info@metrobookshaven.com',
      address: '789 Literary Lane, Boston, MA 02108',
      ownerId: null,
    },
  });

  // 5. Submit initial Ratings
  await prisma.rating.createMany({
    data: [
      { userId: user1.id, storeId: store1.id, rating: 5 },
      { userId: user2.id, storeId: store1.id, rating: 4 },
      { userId: user1.id, storeId: store2.id, rating: 4 },
      { userId: user2.id, storeId: store2.id, rating: 5 },
      { userId: user1.id, storeId: store3.id, rating: 3 },
    ],
  });

  console.log('Seeding completed successfully!');
  console.log('Default credentials:');
  console.log('Admin: admin@storerating.com / Admin@12345');
  console.log('Store Owner: owner@storerating.com / Owner@12345');
  console.log('Normal User: alice@storerating.com / User@12345');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
