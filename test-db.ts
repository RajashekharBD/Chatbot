import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    console.log('Connecting to Prisma...')
    const userCount = await prisma.user.count()
    console.log('User count:', userCount)
    console.log('Success!')
  } catch (e) {
    console.error('Error connecting to Prisma:')
    console.error(e)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
