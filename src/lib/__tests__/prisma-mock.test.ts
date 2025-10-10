/**
 * Example test demonstrating how to use Prisma mocks
 */

import {
  prismaMock,
  resetPrismaMock,
  mockAnimal,
  mockWeightRecord
} from '../prisma-mock'

describe('Prisma Mock Examples', () => {
  beforeEach(() => {
    resetPrismaMock()
  })

  it('should mock finding an animal', async () => {
    // Setup mock
    prismaMock.animal.findUnique.mockResolvedValue(mockAnimal)

    // Call the mocked function
    const animal = await prismaMock.animal.findUnique({
      where: { id: 1 }
    })

    // Assertions
    expect(animal).toEqual(mockAnimal)
    expect(prismaMock.animal.findUnique).toHaveBeenCalledWith({
      where: { id: 1 }
    })
  })

  it('should mock creating an animal', async () => {
    const newAnimal = {
      ...mockAnimal,
      id: 2,
      tagNumber: 'TEST002'
    }

    prismaMock.animal.create.mockResolvedValue(newAnimal)

    const created = await prismaMock.animal.create({
      data: {
        tagNumber: 'TEST002',
        type: 'SHEEP',
        birthDate: new Date('2023-01-01')
      }
    })

    expect(created).toEqual(newAnimal)
    expect(created.tagNumber).toBe('TEST002')
  })

  it('should mock finding animals with weights', async () => {
    const animalWithWeights = {
      ...mockAnimal,
      weights: [mockWeightRecord]
    }

    prismaMock.animal.findMany.mockResolvedValue([animalWithWeights])

    const animals = await prismaMock.animal.findMany({
      include: { weights: true }
    })

    expect(animals).toHaveLength(1)
    expect(animals[0].weights).toHaveLength(1)
    expect(animals[0].weights[0]).toEqual(mockWeightRecord)
  })

  it('should mock creating a weight record', async () => {
    const newWeight = {
      ...mockWeightRecord,
      id: 2,
      weight: 50.5
    }

    prismaMock.weightRecord.create.mockResolvedValue(newWeight)

    const created = await prismaMock.weightRecord.create({
      data: {
        animalId: 1,
        weight: 50.5,
        notes: 'Test weight'
      }
    })

    expect(created.weight).toBe(50.5)
  })

  it('should mock database errors', async () => {
    // Mock a database error
    prismaMock.animal.findUnique.mockRejectedValue(
      new Error('Database connection failed')
    )

    // Test error handling
    await expect(
      prismaMock.animal.findUnique({
        where: { id: 1 }
      })
    ).rejects.toThrow('Database connection failed')
  })
})
