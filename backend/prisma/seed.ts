import { PrismaClient, Role } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';

dotenv.config();

const adapter = new PrismaPg({
  connectionString: process.env['DATABASE_URL'] as string,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = 'admin@taskapp.com';
  const password = 'Admin@1234';

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`Admin already exists: ${email}`);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const admin = await prisma.user.create({
    data: { email, passwordHash, role: Role.ADMIN },
  });

  console.log(`✅ Admin created`);
  console.log(`   Email:    ${admin.email}`);
  console.log(`   Password: ${password}`);
  console.log(`   Role:     ${admin.role}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
