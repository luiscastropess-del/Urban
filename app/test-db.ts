import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();
async function test() {
  const places = await db.place.findMany();
  console.log("Total places in DB:", places.length);
  if (places.length > 0) {
    console.log("Sample place city:", places[0].city, places[0].state);
  }
}
test().catch(console.error).finally(() => process.exit(0));
