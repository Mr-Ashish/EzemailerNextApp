'use client';

import Link from 'next/link';
import { authenticateAction } from '@/app/lib/actions';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFormState } from 'react-dom';
import { useState } from 'react';

export default function LoginForm() {
  const [errorMessage, formAction] = useFormState(
    authenticateAction,
    undefined
  );
  const [isPending, setIsPending] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center space-y-6">
      {/* Ezemailer Heading */}
      <h1 className="text-4xl font-bold">EzeMailer</h1>

      {/* Login Card */}
      <Card className="mx-auto max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <form action={formAction}>
          <CardContent>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="m@example.com"
                  required
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href="/forgot"
                    className="ml-auto inline-block text-sm underline"
                  >
                    Forgot your password?
                  </Link>
                </div>
                <Input id="password" type="password" name="password" required />
              </div>
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? 'Logging in...' : 'Login'}
              </Button>
            </div>
          </CardContent>
        </form>
      </Card>

      {/* Sign Up Link */}
      <p className="text-sm text-gray-500">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="text-blue-600 hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
