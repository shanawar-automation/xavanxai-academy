import { PrismaClient, UserRole } from "@prisma/client";
import { AUTONOMOUS_AGENTS, OPEN_POSITIONS } from "../src/data/xavanData";
import crypto from "crypto";
import { hashPassword } from "../src/lib/password";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding XavanXAI Autonomous Headquarters database...");

  // 1. Seed Departments & 12 Autonomous Agents
  for (const agent of AUTONOMOUS_AGENTS) {
    const dept = await prisma.department.upsert({
      where: { slug: agent.id },
      update: { name: agent.department, orbitRadius: agent.orbitRing * 8.0 },
      create: {
        slug: agent.id,
        name: agent.department,
        orbitRadius: agent.orbitRing * 8.0,
      },
    });

    await prisma.agent.upsert({
      where: { codeName: agent.codeName },
      update: {
        name: agent.name,
        roleTitle: agent.role,
        departmentId: dept.id,
        allowedTools: agent.permissions,
      },
      create: {
        codeName: agent.codeName,
        name: agent.name,
        roleTitle: agent.role,
        departmentId: dept.id,
        allowedTools: agent.permissions,
        llmProvider: "openai",
        llmModel: "gpt-4o",
      },
    });
  }

  // 2. Seed Active Job Positions
  for (const pos of OPEN_POSITIONS) {
    await prisma.jobPosition.upsert({
      where: { slug: pos.slug },
      update: {
        title: pos.title,
        department: pos.department,
        location: pos.location,
        type: pos.type,
        summary: pos.summary,
        requirements: pos.requirements,
      },
      create: {
        slug: pos.slug,
        title: pos.title,
        department: pos.department,
        location: pos.location,
        type: pos.type,
        summary: pos.summary,
        requirements: pos.requirements,
        isActive: true,
      },
    });
  }

  // 3. Seed Initial Super Admin (Change password immediately in production)
  const adminEmail = process.env.INITIAL_ADMIN_EMAIL || "admin@xavanxai.com";
  // Never ship a hard-coded admin password: use the env value or generate a random one.
  const generated = !process.env.INITIAL_ADMIN_PASSWORD;
  const adminPass =
    process.env.INITIAL_ADMIN_PASSWORD || crypto.randomBytes(12).toString("base64url");

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      fullName: "XavanXAI Principal Architect",
      passwordHash: hashPassword(adminPass),
      role: UserRole.SUPER_ADMIN,
      gdprConsentAt: new Date(),
    },
  });

  if (generated) {
    console.log("\n──────────────────────────────────────────────");
    console.log(" Initial admin created (shown ONCE — save it now)");
    console.log(` Email:    ${adminEmail}`);
    console.log(` Password: ${adminPass}`);
    console.log("──────────────────────────────────────────────\n");
  }

  console.log("Seed completed successfully.");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });