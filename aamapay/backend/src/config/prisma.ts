import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:/home/sajan_poudel/Desktop/hackathoncolona/aamapay/database/dev.db',
    },
  },
});

export default prisma;