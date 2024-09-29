import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import type { User } from '@/app/lib/definitions';
import bcrypt from 'bcrypt';
import { sendEmail } from './app/lib/resendActions';

const prisma = new PrismaClient();

async function getUser(email: string): Promise<User | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    return user;
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw new Error('Failed to fetch user.');
  } finally {
    await prisma.$disconnect();
  }
}

export async function resetPassword(email: string, id: string) {
  try {
    const user = await getUser(email);
    if (!user) throw new Error('No user found with that email address');

    // Generate reset token and send email here
    // For example, you can generate a reset token and store it in the database.
    // After that, you'd send an email to the user with a reset link containing the token.
    const resetToken = bcrypt.hashSync(user.email + Date.now(), 10);
    await prisma.user.update({
      where: { email },
      data: {
        resetToken: resetToken,
        resetTokenExpiry: Date.now() + 36000000, // Token expires in 10 hour
      },
    });

    // Send email with the reset token
    // console.log(`Send email to ${user.email} with token: ${resetToken}`);
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;
    const subject = 'Password Reset Request';
    const htmlContent = `<p>Click the link below to reset your password:</p>
                       <a href="${resetLink}">${resetLink}</a>`;

    await sendEmail(user.email, subject, htmlContent);
  } catch (error) {
    console.error('Failed to reset password:', error);
    return false;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  pages: {
    signIn: '/login',
    signOut: '/logout',
    error: '/error',
    verifyRequest: '/forgot',
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          const user = await getUser(email);
          if (!user || !user.password) return null;
          const passwordsMatch = await bcrypt.compare(password, user.password);
          if (passwordsMatch) return user;
        } else {
          console.log('Invalid credentials');
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async authorized({ auth, request: { nextUrl } }) {
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
    async session({ session, token }) {
      console.log('Session callback', { session, token });
      session.userId = token.userId; // Add userId to session
      return session;
    },
    async jwt({ token, user }) {
      console.log('JWT callback', { token, user });

      if (user) {
        token.userId = user.id; // Add userId to JWT token
      }
      return token;
    },
  },
  secret: process.env.AUTH_SECRET, // Add this line
});
