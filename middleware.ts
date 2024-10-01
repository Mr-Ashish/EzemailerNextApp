import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import NextAuth from 'next-auth';

const authRoutes = ['/', '/login', '/signup', '/error', '/forgot'];

const defaultConfig = {
  pages: {
    signIn: '/login',
    signOut: '/logout',
    error: '/error',
    verifyRequest: '/forgot',
  },
  debug: true,
  providers: [],
  callbacks: {
    async authorized({ auth, request: { nextUrl } }: any) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      } else if (isLoggedIn) {
        return Response.redirect(new URL('/dashboard', nextUrl));
      }
      return true;
    },
    async session({ session, token }: any) {
      console.log('Session callback', { session, token });
      const sessionClone = { ...session };
      sessionClone.userId = (token.userId as string).toString(); // Add userId to session
      return sessionClone;
    },
    async jwt({ token, user }: any) {
      console.log('JWT callback', { token, user });

      if (user) {
        token.userId = user.id; // Add userId to JWT token
      }
      return token;
    },
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.AUTH_SECRET, // Add this line
};

const { auth } = NextAuth(defaultConfig);

export const middleware = auth(async function (req: any) {
  const isLoggedIn = !!req.auth;
  console.log('isLoggedIn', isLoggedIn);
  const isAuthRoute = authRoutes.includes(req.nextUrl.pathname);
  const isApiAuthRoute = req.nextUrl.pathname.startsWith('/api/auth');
  console.log('login', isLoggedIn, isAuthRoute, isApiAuthRoute);

  // Allow the auth routes and API auth routes to pass through
  if (isApiAuthRoute) {
    return NextResponse.next();
  }

  if (isAuthRoute) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
    return NextResponse.next();
  }

  if (!isLoggedIn && !isAuthRoute) {
    console.log('redirecting to login', isLoggedIn);
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$|.*\\.svg$).*)'],
};
