import { prisma, seedDatabase } from '../src/db.js';

async function main() {
  await seedDatabase();
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
