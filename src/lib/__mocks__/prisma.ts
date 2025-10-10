/**
 * Mock implementation of Prisma Client for Jest tests
 *
 * This file automatically replaces the real Prisma Client when
 * jest.mock('@/lib/prisma') is called in tests.
 */

import { prismaMock } from '../prisma-mock'

export const prisma = prismaMock
