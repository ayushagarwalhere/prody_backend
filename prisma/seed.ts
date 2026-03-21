import { PrismaClient, Role } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcrypt";
import { config } from "dotenv";

// Load environment variables
config();

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;
  const email    = process.env.ADMIN_EMAIL;

  if (!username || !password || !email) {
    throw new Error(
      "Missing env vars: ADMIN_USERNAME, ADMIN_PASSWORD and ADMIN_EMAIL must all be set."
    );
  }

  console.log("Seeding admin user...");
  console.log(`Email: ${email}`);
  console.log(`Username: ${username}`);

  const hashed = await bcrypt.hash(password, 12);

  const admin = await prisma.user.upsert({
    where:  { email },
    update: {
      password: hashed,
      username,
      name:     username,
      role:     Role.ADMIN,
      verified: true,
    },
    create: {
      email,
      password: hashed,
      username,
      name:      username,
      role:      Role.ADMIN,
      verified:  true,
      avatarUrl: `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${username}`,
    },
  });

  console.log(`✓ Admin seeded: ${admin.email} (@${admin.username})`);
}

main()
  .catch(e => { 
    console.error("Error seeding admin:", e); 
    process.exit(1); 
  })
  .finally(() => prisma.$disconnect());