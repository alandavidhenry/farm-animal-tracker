import { withAuth } from 'next-auth/middleware'

export default withAuth(
  function middleware() {
    // Add custom middleware logic here if needed
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    }
  }
)

export const config = {
  matcher: [
    // Protect all routes except auth pages and public assets
    '/((?!api/auth|auth|_next/static|_next/image|favicon.ico|public).*)'
  ]
}
