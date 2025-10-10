/**
 * Prisma Mock Utilities for Testing
 *
 * This module provides utilities for mocking Prisma Client in tests.
 * Use this to avoid hitting the actual database during unit tests.
 */

import { PrismaClient } from '@prisma/client'
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended'

// Create a mock Prisma Client
export const prismaMock = mockDeep<PrismaClient>()

// Reset mock between tests
export const resetPrismaMock = () => {
  mockReset(prismaMock)
}

// Type for mocked Prisma Client
export type PrismaMockType = DeepMockProxy<PrismaClient>

// Mock data helpers
export const mockAnimal = {
  id: 1,
  tagNumber: 'TEST001',
  type: 'SHEEP',
  motherId: null,
  birthDate: new Date('2023-01-01'),
  createdAt: new Date('2023-01-01'),
  updatedAt: new Date('2023-01-01')
}

export const mockWeightRecord = {
  id: 1,
  animalId: 1,
  weight: 45.5,
  recordedAt: new Date('2023-01-01'),
  notes: 'Test weight record'
}

export const mockFeedRecord = {
  id: 1,
  animalId: 1,
  feedType: 'Hay',
  amount: 5.0,
  feedDate: new Date('2023-01-01')
}

// Helper to create mock animals with weights
export const createMockAnimalWithWeights = (
  overrides: Partial<typeof mockAnimal> = {},
  weightCount = 1
) => {
  const animal = { ...mockAnimal, ...overrides }
  const weights = Array.from({ length: weightCount }, (_, i) => ({
    ...mockWeightRecord,
    id: i + 1,
    animalId: animal.id,
    recordedAt: new Date(Date.now() - i * 86400000) // Each day older
  }))

  return {
    ...animal,
    weights
  }
}
