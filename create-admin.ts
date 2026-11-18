import "dotenv/config";
import { PrismaClient } from "./src/generated/prisma/client";
import bcrypt from "bcryptjs";
import { createInterface } from "readline/promises";

const prisma = new PrismaClient();

async function main() {
  const terminal = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  try {
    const name = await terminal.question("Admin name: ");
    const email = await terminal.question("Admin email: ");
    const password = await terminal.question("Create admin password: ");

    if (!name.trim() || !email.trim() || password.length < 8) {
      throw new Error("Enter valid details. Password must have at least 8 characters.");
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const admin = await prisma.user.upsert({
      where: { email: email.trim().toLowerCase() },
      update: {
        name: name.trim(),
        password: hashedPassword,
        role: "ADMIN",
      },
      create: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: hashedPassword,
        role: "ADMIN",
      },
    });

    console.log("Admin account created or updated:", admin.email);
  } finally {
    terminal.close();
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error("Admin account setup failed:", error);
  process.exitCode = 1;
});
