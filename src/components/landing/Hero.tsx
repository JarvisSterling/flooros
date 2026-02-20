import Link from 'next/link';
import './animations.css';

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-[#0f172a] via-[#0f172a] to-[#131c33] pt-20">
      {/* Animated SVG grid background */}
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        <svg className="absolute inset-0 h-full w-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          {/* Floating booth shapes */}
          <rect x="15%" y="25%" width="80" height="50" rx="8" fill="rgba(59,130,246,0.08)" className="animate-float-slow" />
          <rect x="70%" y="35%" width="60" height="60" rx="8" fill="rgba(59,130,246,0.06)" className="animate-float-medium" />
          <rect x="45%" y="65%" width="100" height="40" rx="8" fill="rgba(59,130,246,0.07)" className="animate-float-slow" />
          <rect x="80%" y="70%" width="50" height="70" rx="8" fill="rgba(59,130,246,0.05)" className="animate-float-medium" />
          <rect x="25%" y="75%" width="70" height="45" rx="8" fill="rgba(59,130,246,0.06)" className="animate-float-slow" />
        </svg>
        {/* Radial glow */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-blue-500/10 blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
        <h1 className="text-5xl font-bold leading-tight tracking-tight text-white sm:text-6xl lg:text-7xl">
          Event Floor Plans,{' '}
          <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">Reimagined</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-white/60 sm:text-xl">
          Create interactive floor plans, manage exhibitors, and delight attendees — all in one platform
        </p>
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/signup"
            className="rounded-xl bg-blue-500 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-blue-600 hover:shadow-blue-500/40"
          >
            Get Started Free
          </Link>
          <Link
            href="/demo"
            className="rounded-xl border border-white/10 bg-white/5 px-8 py-3.5 text-base font-semibold text-white backdrop-blur transition-all hover:bg-white/10"
          >
            See Demo
          </Link>
        </div>
      </div>
    </section>
  );
}
