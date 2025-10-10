import { prisma } from '../prisma'

describe('Prisma Client', () => {
  it('should export a prisma client instance', () => {
    expect(prisma).toBeDefined()
    expect(typeof prisma).toBe('object')
  })

  it('should have expected Prisma client methods', () => {
    expect(prisma.$connect).toBeDefined()
    expect(prisma.$disconnect).toBeDefined()
  })
})
