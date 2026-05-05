import prisma from '../src/prismaClient';

async function main() {
  const alice = await prisma.user.upsert({
    where: { email: 'alice@example.com' },
    update: {},
    create: { email: 'alice@example.com', name: 'Alice' },
  });

  await prisma.post.create({ data: { title: 'Hello World', content: 'First post', authorId: alice.id } });
  console.log('Seed complete');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
