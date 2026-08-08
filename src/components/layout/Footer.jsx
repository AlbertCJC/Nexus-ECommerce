import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <footer className="bg-[rgb(var(--bg-deep))] text-[rgb(var(--text-secondary))] border-t border-[rgb(var(--border-subtle))]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-[rgb(var(--text-primary))] mb-4">
              <span className="flex items-center gap-2">
                <svg className="w-6 h-6" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="32" height="32" rx="8" fill="url(#footer-gradient)"/>
                  <path d="M8 16L14 22L24 10" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                  <defs>
                    <linearGradient id="footer-gradient" x1="0" y1="0" x2="32" y2="32">
                      <stop offset="0%" stopColor="rgb(var(--accent-primary))"/>
                      <stop offset="100%" stopColor="rgb(var(--accent-secondary))"/>
                    </linearGradient>
                  </defs>
                </svg>
                NEXUS
              </span>
            </h3>
            <p className="text-sm leading-relaxed text-[rgb(var(--text-muted))]">Your ultimate destination for premium gaming peripherals, components, and gear from top brands. Built by gamers, for gamers.</p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-[rgb(var(--text-primary))] uppercase tracking-wider mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-[rgb(var(--accent-primary))] transition-colors">Home</Link></li>
              <li><Link to="/products" className="hover:text-[rgb(var(--accent-primary))] transition-colors">Products</Link></li>
              <li><Link to="/cart" className="hover:text-[rgb(var(--accent-primary))] transition-colors">Cart</Link></li>
              <li><Link to="/checkout" className="hover:text-[rgb(var(--accent-primary))] transition-colors">Checkout</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-[rgb(var(--text-primary))] uppercase tracking-wider mb-4">Categories</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/products?category=cat-mice" className="hover:text-[rgb(var(--accent-primary))] transition-colors">Gaming Mice</Link></li>
              <li><Link to="/products?category=cat-keyboards" className="hover:text-[rgb(var(--accent-primary))] transition-colors">Keyboards</Link></li>
              <li><Link to="/products?category=cat-headsets" className="hover:text-[rgb(var(--accent-primary))] transition-colors">Headsets</Link></li>
              <li><Link to="/products?category=cat-monitors" className="hover:text-[rgb(var(--accent-primary))] transition-colors">Monitors</Link></li>
              <li><Link to="/products?category=cat-laptops" className="hover:text-[rgb(var(--accent-primary))] transition-colors">Laptops & PCs</Link></li>
              <li><Link to="/products?category=cat-components" className="hover:text-[rgb(var(--accent-primary))] transition-colors">Components</Link></li>
              <li><Link to="/products?category=cat-accessories" className="hover:text-[rgb(var(--accent-primary))] transition-colors">Accessories</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-[rgb(var(--text-primary))] uppercase tracking-wider mb-4">Contact Us</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2"><svg className="w-5 h-5 text-[rgb(var(--accent-primary))]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg> 123 Tech Street, San Francisco, CA 94101</li>
              <li className="flex items-center gap-2"><svg className="w-5 h-5 text-[rgb(var(--accent-primary))]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg> +1 (555) 123-4567</li>
              <li className="flex items-center gap-2"><svg className="w-5 h-5 text-[rgb(var(--accent-primary))]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg> support@codecraftstore.com</li>
            </ul>
            <div className="flex gap-4 mt-6">
              <a href="#" className="min-w-[44px] min-h-[44px] flex items-center justify-center text-[rgb(var(--text-muted))] hover:text-[rgb(var(--accent-primary))] transition-colors rounded-lg" aria-label="Discord"><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.485 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.675 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.34a.083.083 0 0 0 .031.057 19.9 19.9 0 0 0 5.992 7.228.077.077 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-.257.076.076 0 0 0 .041-.106 13.107 13.107 0 0 0 .636-1.955.074.074 0 0 1 .079-.078c.542-.148 1.113-.248 1.653-.306.07-.007.12.054.082.113a13.273 13.273 0 0 1-.197 2.72.077.077 0 0 0-.002.15.076.076 0 0 0 .06.043 19.77 19.77 0 0 0 5.838-1.125.077.077 0 0 0 .028-.121 12.56 12.56 0 0 0-.175-.829.077.077 0 0 1 .023-.128c.28-.618.476-1.308.565-1.95a.07.07 0 0 1 .137-.021 20.176 20.176 0 0 0 4.342-6.31.077.077 0 0 0-.03-.115ZM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.166-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.166 2.418Zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.177-2.419 1.21 0 2.176 1.086 2.157 2.418 0 1.334-.956 2.419-2.177 2.419Z"/></svg></a>
              <a href="#" className="min-w-[44px] min-h-[44px] flex items-center justify-center text-[rgb(var(--text-muted))] hover:text-[rgb(var(--accent-primary))] transition-colors rounded-lg" aria-label="YouTube"><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814ZM9.545 15.568V8.432L16.813 12 9.545 15.568Z"/></svg></a>
              <a href="#" className="min-w-[44px] min-h-[44px] flex items-center justify-center text-[rgb(var(--text-muted))] hover:text-[rgb(var(--accent-primary))] transition-colors rounded-lg" aria-label="Twitter"><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/></svg></a>
            </div>
          </div>
        </div>
        <div className="mt-10 border-t border-[rgb(var(--border-subtle))] pt-8 text-center text-sm text-[rgb(var(--text-muted))]">
          <p>&copy; {new Date().getFullYear()} NEXUS GAMING. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}