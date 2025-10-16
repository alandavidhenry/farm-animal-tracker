/**
 * Example test demonstrating how to use Prisma mocks
 */

import {
  prismaMock,
  resetPrismaMock,
  mockAnimal,
  mockWeightRecord,
  mockFeedRecord,
  createMockAnimalWithWeights
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

describe('Mock Data Helpers', () => {
  it('should provide mock animal data', () => {
    expect(mockAnimal).toBeDefined()
    expect(mockAnimal.tagNumber).toBe('TEST001')
    expect(mockAnimal.type).toBe('SHEEP')
  })

  it('should provide mock weight record data', () => {
    expect(mockWeightRecord).toBeDefined()
    expect(mockWeightRecord.weight).toBe(45.5)
    expect(mockWeightRecord.animalId).toBe(1)
  })

  it('should provide mock feed record data', () => {
    expect(mockFeedRecord).toBeDefined()
    expect(mockFeedRecord.feedType).toBe('Hay')
    expect(mockFeedRecord.amount).toBe(5.0)
  })

  it('should create mock animal with default weights', () => {
    const result = createMockAnimalWithWeights()

    expect(result).toBeDefined()
    expect(result.tagNumber).toBe('TEST001')
    expect(result.weights).toHaveLength(1)
  })

  it('should create mock animal with multiple weights', () => {
    const result = createMockAnimalWithWeights({}, 3)

    expect(result.weights).toHaveLength(3)
    expect(result.weights[0].id).toBe(1)
    expect(result.weights[1].id).toBe(2)
    expect(result.weights[2].id).toBe(3)
  })

  it('should create mock animal with overrides', () => {
    const result = createMockAnimalWithWeights({
      tagNumber: 'CUSTOM123',
      type: 'GOAT'
    })

    expect(result.tagNumber).toBe('CUSTOM123')
    expect(result.type).toBe('GOAT')
  })

  it('should create weights with correct animal id from overrides', () => {
    const result = createMockAnimalWithWeights({ id: 999 }, 2)

    expect(result.id).toBe(999)
    expect(result.weights[0].animalId).toBe(999)
    expect(result.weights[1].animalId).toBe(999)
  })

  it('should create weights with descending dates', () => {
    const result = createMockAnimalWithWeights({}, 3)

    const date1 = new Date(result.weights[0].recordedAt).getTime()
    const date2 = new Date(result.weights[1].recordedAt).getTime()
    const date3 = new Date(result.weights[2].recordedAt).getTime()

    expect(date1).toBeGreaterThan(date2)
    expect(date2).toBeGreaterThan(date3)
  })
})

describe('Reset Functionality', () => {
  it('should reset mock state between tests', () => {
    prismaMock.animal.findUnique.mockResolvedValue(mockAnimal)

    expect(prismaMock.animal.findUnique).toBeDefined()

    resetPrismaMock()

    // After reset, the mock should still be defined but cleared
    expect(prismaMock.animal.findUnique).toBeDefined()
  })
})
