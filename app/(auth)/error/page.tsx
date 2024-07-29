import Link from 'next/link';

export default function Error() {
  return (
    <main className="flex h-full flex-col items-center justify-center">
      <h2 className="text-center">
        Authentication error occurred! Please Sign-in again.
      </h2>
      <Link href="/login" className="underline">
        Sign in
      </Link>
    </main>
  );
}
