const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Searching database for text containing "tintw" or "tint"...');

  const users = await prisma.user.findMany();
  console.log(`Found ${users.length} users.`);
  for (const u of users) {
    if (JSON.stringify(u).toLowerCase().includes('tintw') || JSON.stringify(u).toLowerCase().includes('tint')) {
      console.log('Match in User:', u);
    }
  }

  const properties = await prisma.property.findMany();
  console.log(`Found ${properties.length} properties.`);
  for (const p of properties) {
    if (JSON.stringify(p).toLowerCase().includes('tintw') || JSON.stringify(p).toLowerCase().includes('tint')) {
      console.log('Match in Property:', p);
    }
  }

  const conversations = await prisma.conversation.findMany();
  console.log(`Found ${conversations.length} conversations.`);
  for (const c of conversations) {
    if (JSON.stringify(c).toLowerCase().includes('tintw') || JSON.stringify(c).toLowerCase().includes('tint')) {
      console.log('Match in Conversation:', c);
    }
  }

  const messages = await prisma.message.findMany();
  console.log(`Found ${messages.length} messages.`);
  for (const m of messages) {
    if (JSON.stringify(m).toLowerCase().includes('tintw') || JSON.stringify(m).toLowerCase().includes('tint')) {
      console.log('Match in Message:', m);
    }
  }

  const notifications = await prisma.notification.findMany();
  console.log(`Found ${notifications.length} notifications.`);
  for (const n of notifications) {
    if (JSON.stringify(n).toLowerCase().includes('tintw') || JSON.stringify(n).toLowerCase().includes('tint')) {
      console.log('Match in Notification:', n);
    }
  }

  console.log('Database search complete.');
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
