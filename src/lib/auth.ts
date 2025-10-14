import bcrypt from 'bcryptjs'
import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

import { prisma } from '@/lib/prisma'

// Extend NextAuth types
declare module 'next-auth' {
  interface User {
    id: string
    role: string
  }

  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role: string
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: string
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // Try to find user in database
        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (user && user.active) {
          // Verify password
          const isValid = await bcrypt.compare(
            credentials.password,
            user.password
          )

          if (isValid) {
            return {
              id: user.id.toString(),
              name: user.name,
              email: user.email,
              role: user.role
            }
          }
        }

        return null
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  pages: {
    signIn: '/auth/signin'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id
        session.user.role = token.role
      }
      return session
    }
  }
}
