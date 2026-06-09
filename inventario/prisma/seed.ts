import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@prisma/client";

const url = process.env.DATABASE_URL ?? "file:./dev.db";
const adapter = new PrismaBetterSqlite3({ url });
const prisma = new PrismaClient({ adapter });

async function main() {
  const categoryNames = ["Llaveros", "Imanes", "Camisetas", "Tazas", "Artesanías", "Pulseras"];
  const categories = await Promise.all(
    categoryNames.map((name) =>
      prisma.category.upsert({ where: { name }, update: {}, create: { name } })
    )
  );

  await prisma.appSettings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      currency: "USD",
      openrouterModel: "openai/gpt-4o-mini",
      activeCategoriesJson: JSON.stringify(categories.map((c) => c.id)),
    },
  });

  console.log("Seed completado:", categoryNames.join(", "));
}

main().catch(console.error).finally(() => prisma.$disconnect());
