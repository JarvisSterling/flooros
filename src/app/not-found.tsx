import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0a0a0f] px-4 text-center">
      <div className="text-8xl font-bold text-white/10">404</div>
      <h1 className="mt-4 text-2xl font-bold text-white">Page Not Found</h1>
      <p className="mt-2 max-w-md text-white/50">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
        Let&apos;s get you back on track.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex rounded-lg bg-blue-500 px-6 py-3 text-sm font-medium text-white transition hover:bg-blue-600"
      >
        Back to Home
      </Link>
    </div>
  );
}
