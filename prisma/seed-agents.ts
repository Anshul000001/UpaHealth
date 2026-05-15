import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";
import { AGENTS } from "../src/lib/agents/registry";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL not set");
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🤖 Seeding AI Operating System agents...\n");

  for (const def of AGENTS) {
    await prisma.aIAgent.upsert({
      where: { name: def.name },
      update: {
        role: def.role,
        description: def.description,
        capabilities: def.capabilities,
        systemPrompt: def.systemPrompt,
        schedule: def.schedule ?? null,
      },
      create: {
        name: def.name,
        role: def.role,
        description: def.description,
        capabilities: def.capabilities,
        systemPrompt: def.systemPrompt,
        schedule: def.schedule ?? null,
        modelProvider: "nvidia",
        modelName: "meta/llama-3.1-8b-instruct",
      },
    });
    console.log(`  ✅ ${def.name} — ${def.role}`);
  }

  console.log(`\n🎉 ${AGENTS.length} agents registered.`);
}

main()
  .then(async () => { await prisma.$disconnect(); })
  .catch(async (e) => {
    console.error("❌ Seed error:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
