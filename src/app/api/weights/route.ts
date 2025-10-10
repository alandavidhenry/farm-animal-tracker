import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { tagNumber, weight, notes } = body

    // Validate required fields
    if (!tagNumber || !weight) {
      return NextResponse.json(
        { error: 'Missing required fields: tagNumber, weight' },
        { status: 400 }
      )
    }

    // Find the animal by tag number
    const animal = await prisma.animal.findUnique({
      where: { tagNumber }
    })

    if (!animal) {
      return NextResponse.json(
        { error: 'Animal not found with this tag number' },
        { status: 404 }
      )
    }

    // Create weight record
    const weightRecord = await prisma.weightRecord.create({
      data: {
        animalId: animal.id,
        weight: parseFloat(weight),
        notes: notes || null
      },
      include: {
        animal: {
          select: {
            tagNumber: true,
            type: true
          }
        }
      }
    })

    return NextResponse.json(
      {
        message: 'Weight recorded successfully',
        weightRecord
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error recording weight:', error)
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
    const animalId = searchParams.get('animalId')

    let weights

    if (tagNumber) {
      // Get weights for specific animal by tag number
      weights = await prisma.weightRecord.findMany({
        where: {
          animal: {
            tagNumber
          }
        },
        include: {
          animal: {
            select: {
              tagNumber: true,
              type: true
            }
          }
        },
        orderBy: {
          recordedAt: 'desc'
        }
      })
    } else if (animalId) {
      // Get weights for specific animal by ID
      weights = await prisma.weightRecord.findMany({
        where: {
          animalId: parseInt(animalId)
        },
        include: {
          animal: {
            select: {
              tagNumber: true,
              type: true
            }
          }
        },
        orderBy: {
          recordedAt: 'desc'
        }
      })
    } else {
      // Get all recent weights
      weights = await prisma.weightRecord.findMany({
        include: {
          animal: {
            select: {
              tagNumber: true,
              type: true
            }
          }
        },
        orderBy: {
          recordedAt: 'desc'
        },
        take: 50 // Limit to last 50 records
      })
    }

    return NextResponse.json({ weights })
  } catch (error) {
    console.error('Error fetching weights:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
