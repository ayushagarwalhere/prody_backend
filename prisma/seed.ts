import { PrismaClient } from "@prisma/client";
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;
  const email    = process.env.ADMIN_EMAIL;

  if (!username || !password || !email) {
    throw new Error(
      "Missing env vars: ADMIN_USERNAME, ADMIN_PASSWORD, ADMIN_EMAIL must all be set."
    );
  }

  const hashed = await bcrypt.hash(password, 12);

  const admin = await prisma.user.upsert({
    where:  { email },
    update: {
      password:  hashed,
      username,
      role:      "ADMIN",
      verified:  true,
    },
    create: {
      email,
      password:  hashed,
      username,
      name:      username,
      role:      "ADMIN",
      verified:  true,
      avatarUrl: `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${username}`,
    },
  });

  console.log(`✓ Admin seeded: ${admin.email} (@${admin.username})`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());