import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { auth } from './auth.config';

const authRoutes = ['/login', '/signup', '/error', '/forgot'];

export default auth(async (req: NextRequest) => {
  const { nextUrl } = req;

  console.log('middleware', req);
  const token = await getToken({ req, secret: process.env.AUTH_SECRET });
  // console.log('token has been generated', token, process.env.AUTH_SECRET, req);
  const isLoggedIn = !!token;
  console.log('isLoggedIn', isLoggedIn);
  const isAuthRoute = authRoutes.includes(req.nextUrl.pathname);
  const isApiAuthRoute = req.nextUrl.pathname.startsWith('/api/auth');
  // console.log('login', isLoggedIn, req);

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
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
