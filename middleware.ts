import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import NextAuth from 'next-auth';
import authConfig from './auth.config';

const authRoutes = ['/', '/login', '/signup', '/error', '/forgot'];

const { auth } = NextAuth(authConfig);

export const middleware = auth(async function (req: any) {
  console.log('middleware', req);
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
      return Response.redirect(new URL('/dashboard', req.nextUrl));
    }
    return NextResponse.next();
  }

  if (!isLoggedIn && !isAuthRoute) {
    console.log('redirecting to login', isLoggedIn);
    return Response.redirect(new URL('/login', req.nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$|.*\\.svg$).*)'],
};
