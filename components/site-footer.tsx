import Link from 'next/link';
import { XerefLogo } from '@/components/xeref-logo';

export function SiteFooter() {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 font-bold text-base mb-3">
              <XerefLogo className="h-7 w-7" />
              Xeref
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-[200px]">
              AI agent builder and productivity for people and agents.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-sm font-semibold mb-4">Product</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="/docs" className="hover:text-foreground transition-colors">Docs</Link></li>
              <li><Link href="/pricing" className="hover:text-foreground transition-colors">Pricing</Link></li>
              <li><Link href="/changelog" className="hover:text-foreground transition-colors">Changelog</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm font-semibold mb-4">Company</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="/faq" className="hover:text-foreground transition-colors">FAQ</Link></li>
              <li><Link href="/about" className="hover:text-foreground transition-colors">About</Link></li>
              <li><Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link></li>
              <li><Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold mb-4">Contact</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <a href="mailto:support@xeref.ai" className="hover:text-foreground transition-colors">
                  support@xeref.ai
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t pt-6 text-xs text-muted-foreground font-mono">
          © 2026 Xeref. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
