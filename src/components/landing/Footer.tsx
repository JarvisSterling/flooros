import Link from 'next/link';

const footerLinks = [
  {
    title: 'Product',
    links: [
      { label: 'Features', href: '#features' },
      { label: 'Pricing', href: '#pricing' },
      { label: 'Demo', href: '/demo' },
      { label: 'Changelog', href: '/changelog' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Blog', href: '/blog' },
      { label: 'Careers', href: '/careers' },
      { label: 'Contact', href: '/contact' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Documentation', href: '/docs' },
      { label: 'Help Center', href: '/help' },
      { label: 'API Reference', href: '/api' },
      { label: 'Status', href: '/status' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy', href: '/privacy' },
      { label: 'Terms', href: '/terms' },
      { label: 'Security', href: '/security' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#0a1120]" role="contentinfo">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-1">
            <Link href="/" className="text-xl font-bold text-white" aria-label="FloorOS home">
              Floor<span className="text-blue-500">OS</span>
            </Link>
            <p className="mt-4 text-sm text-white/40">
              Event floor plans, reimagined.
            </p>
            <div className="mt-6 flex gap-4" aria-label="Social media links">
              {['Twitter', 'GitHub', 'LinkedIn'].map((name) => (
                <a
                  key={name}
                  href="#"
                  className="text-sm text-white/30 transition-colors hover:text-white/60"
                  aria-label={name}
                >
                  {name[0]}
                </a>
              ))}
            </div>
          </div>
          {footerLinks.map((group) => (
            <div key={group.title}>
              <h4 className="text-sm font-semibold text-white">{group.title}</h4>
              <ul className="mt-4 space-y-3" role="list">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm text-white/40 transition-colors hover:text-white/70">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-16 border-t border-white/10 pt-8 text-center text-sm text-white/30">
          &copy; {new Date().getFullYear()} FloorOS. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
