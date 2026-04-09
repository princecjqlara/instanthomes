import { createApp } from './app.js';
import { prisma, seedDatabase } from './db.js';

async function bootstrap() {
  await seedDatabase();

  const port = Number(process.env.PORT ?? 4000);
  const app = createApp();

  app.listen(port, () => {
    console.log(`Instant Homes server listening on http://localhost:${port}`);
  });
}

bootstrap().catch(async (error) => {
  console.error(error);
  await prisma.$disconnect();
  process.exit(1);
});
