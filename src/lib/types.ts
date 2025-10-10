// Animal types enum for validation
export enum AnimalType {
  SHEEP = 'SHEEP',
  LAMB = 'LAMB',
  GOAT = 'GOAT',
  CATTLE = 'CATTLE',
  PIG = 'PIG'
}

// Type definitions
export interface Animal {
  id: number
  tagNumber: string
  type: string
  motherId?: number | null
  birthDate?: Date | null
  createdAt: Date
  updatedAt: Date
}

export interface WeightRecord {
  id: number
  animalId: number
  weight: number
  recordedAt: Date
  notes?: string | null
}

export interface FeedRecord {
  id: number
  animalId: number
  feedType: string
  amount: number
  feedDate: Date
}
