import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Create a user
  const user = await prisma.users.create({
    data: {
      email: 'john@example.com',
      passwordHash: 'hashedpassword123',
    },
  });
  console.log('✅ Created user:', user);

  // Get all users
  const users = await prisma.users.findMany();
  console.log('📋 All users:', users);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());