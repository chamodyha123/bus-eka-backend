const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding started...");

  const existingAdmin = await prisma.user.findFirst({
    where: { role: "admin" }
  });

  if (existingAdmin) {
    console.log("⚠️ Admin already exists. Skipping seed.");
    return;
  }

  const hashedPassword = await bcrypt.hash("admin123", 10);

  await prisma.user.create({
    data: {
      name: "System Admin",
      email: "admin@buseka.lk",
      password: hashedPassword,
      role: "admin"
    }
  });

  console.log("✅ Admin created successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });