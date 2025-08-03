import { PrismaClient } from '../lib/generated/prisma'

const prisma = new PrismaClient()

async function main() {
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(() => prisma.$disconnect())
