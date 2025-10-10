import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { AnimalType } from '@/lib/types'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { tagNumber, type, initialWeight, birthDate, notes } = body

    // Validate required fields
    if (!tagNumber || !type || !initialWeight) {
      return NextResponse.json(
        { error: 'Missing required fields: tagNumber, type, initialWeight' },
        { status: 400 }
      )
    }

    // Validate animal type
    if (!Object.values(AnimalType).includes(type)) {
      return NextResponse.json(
        { error: 'Invalid animal type' },
        { status: 400 }
      )
    }

    // Check if tag number already exists
    const existingAnimal = await prisma.animal.findUnique({
      where: { tagNumber }
    })

    if (existingAnimal) {
      return NextResponse.json(
        { error: 'Animal with this tag number already exists' },
        { status: 409 }
      )
    }

    // Create animal with initial weight record
    const animal = await prisma.animal.create({
      data: {
        tagNumber,
        type: type,
        birthDate: birthDate ? new Date(birthDate) : null,
        weights: {
          create: {
            weight: parseFloat(initialWeight),
            notes: notes || `Initial weight for ${tagNumber}`
          }
        }
      },
      include: {
        weights: true
      }
    })

    return NextResponse.json(
      {
        message: 'Animal registered successfully',
        animal
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating animal:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const tagNumber = searchParams.get('tagNumber')

    let animals

    if (tagNumber) {
      // Search for specific animal
      animals = await prisma.animal.findMany({
        where: {
          tagNumber: {
            contains: tagNumber
          }
        },
        include: {
          weights: {
            orderBy: {
              recordedAt: 'desc'
            },
            take: 1 // Get latest weight
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
    } else {
      // Get all animals
      animals = await prisma.animal.findMany({
        include: {
          weights: {
            orderBy: {
              recordedAt: 'desc'
            },
            take: 1 // Get latest weight
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
    }

    return NextResponse.json({ animals })
  } catch (error) {
    console.error('Error fetching animals:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
