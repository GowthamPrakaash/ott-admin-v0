import { PrismaClient } from '../lib/generated/prisma'

const prisma = new PrismaClient()

async function main() {
    await prisma.role.upsert({
        where: { name: 'viewer' },
        update: {},
        create: { name: 'viewer' },
    })
    await prisma.role.upsert({
        where: { name: 'admin' },
        update: {},
        create: { name: 'admin' },
    })
    await prisma.role.upsert({
        where: { name: 'editor' },
        update: {},
        create: { name: 'editor' },
    })
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(() => prisma.$disconnect())
