import { Link } from 'react-router-dom'
import { Scissors, Star, Shield, Clock, ChevronRight, Ruler, Package, Users } from 'lucide-react'

const FEATURES = [
  { icon: Users,   title: 'Customer Profiles',     desc: 'Complete customer records with measurement history and order tracking.' },
  { icon: Ruler,   title: 'Precision Measurements', desc: 'Store shirt, pant and suit measurements with auto-versioning.' },
  { icon: Package, title: 'Order Management',       desc: 'Track every order from intake to delivery with real-time status.' },
  { icon: Scissors,title: 'Tailor Assignments',     desc: 'Assign work, monitor progress and balance your team\'s workload.' },
  { icon: Star,    title: 'Revenue Reports',         desc: 'Daily, monthly and performance reports exported to PDF instantly.' },
  { icon: Shield,  title: 'Multi-Tenant SaaS',       desc: 'Each shop\'s data is fully isolated. Secure, private and scalable.' },
]

const TESTIMONIALS = [
  { name: 'Ahmed Khan', shop: 'Royal Stitches, Lahore', text: 'Our delivery accuracy improved dramatically. Customers love the professional receipts.' },
  { name: 'Bilal Siddiqui', shop: 'Classic Cuts, Karachi', text: 'Managing 3 tailors used to be chaos. Now I see everyone\'s workload at a glance.' },
  { name: 'Fatima Shah', shop: 'Elegance Tailor, Islamabad', text: 'The measurement versioning saved us from costly mistakes. Worth every rupee.' },
]

export default function Landing() {
  return (
    <div className="min-h-screen bg-white text-[#334155] font-serif overflow-x-hidden">

      {/* ── Decorative SVG pattern overlay ────────────────────── */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.05]"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23a62d5d' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}
      />

      {/* ── NAVBAR ───────────────────────────────────────────────── */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-5 border-b border-[#a62d5d]/10 bg-white/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded border border-[#a62d5d]/30 bg-[#a62d5d]/5">
            <Scissors size={18} className="text-[#a62d5d]" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-widest uppercase text-[#0b132b]" style={{ fontFamily: 'Playfair Display, serif' }}>
              TailorSaaS
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm text-[#475569] hover:text-[#a62d5d] transition-colors tracking-wider font-semibold">
            Sign In
          </Link>
          <Link to="/register"
            className="border border-[#a62d5d] text-[#a62d5d] px-5 py-2 text-sm tracking-widest uppercase hover:bg-[#a62d5d] hover:text-white transition-all duration-300">
            Free Trial
          </Link>
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section className="relative min-h-[90vh] flex items-center">
        {/* Background image overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/95 to-white/60" />
        <div className="absolute inset-0"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1400&q=80)',
            backgroundSize: 'cover',
            backgroundPosition: 'center right',
            mixBlendMode: 'multiply',
            opacity: 0.15,
          }}
        />

        <div className="relative z-10 max-w-6xl mx-auto px-8 py-24">
          {/* Decorative rule */}
          <div className="flex items-center gap-4 mb-8">
            <div className="h-px flex-1 max-w-[60px] bg-[#a62d5d]" />
            <span className="text-[#a62d5d] text-xs tracking-[0.3em] uppercase">Est. 2024</span>
            <div className="h-px w-4 bg-[#a62d5d]" />
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-6 text-[#0b132b]"
            style={{ fontFamily: 'Playfair Display, serif' }}>
            The Art of
            <span className="block italic text-[#a62d5d]">Fine Tailoring,</span>
            <span className="block">Managed Digitally</span>
          </h1>

          <p className="text-lg text-[#475569] max-w-xl leading-relaxed mb-10"
            style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.2rem' }}>
            A cloud-based management system crafted for tailoring houses that take pride in precision,
            punctuality, and the enduring elegance of bespoke craftsmanship.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/register"
              className="inline-flex items-center gap-3 bg-[#a62d5d] text-white px-8 py-4 text-sm tracking-widest uppercase font-bold hover:bg-[#c84b7c] transition-all duration-300 shadow-lg shadow-[#a62d5d]/10">
              Begin Your Journey
              <ChevronRight size={16} />
            </Link>
            <Link to="/login"
              className="inline-flex items-center gap-3 border border-[#a62d5d]/40 text-[#a62d5d] px-8 py-4 text-sm tracking-widest uppercase hover:bg-[#a62d5d]/5 transition-all duration-300">
              Sign Into Your Shop
            </Link>
          </div>

          {/* Stats */}
          <div className="flex gap-10 mt-16 pt-10 border-t border-[#a62d5d]/10">
            {[['500+', 'Tailor Shops'], ['50,000+', 'Orders Managed'], ['14 Days', 'Free Trial']].map(([n, l]) => (
              <div key={l}>
                <div className="text-2xl font-bold text-[#a62d5d]" style={{ fontFamily: 'Playfair Display, serif' }}>{n}</div>
                <div className="text-xs text-[#64748b] tracking-widest uppercase mt-0.5">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ORNAMENTAL DIVIDER ───────────────────────────────────── */}
      <div className="flex items-center justify-center py-8 px-8">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[#a62d5d]/20" />
        <div className="mx-6 text-[#a62d5d] text-2xl">✦</div>
        <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[#a62d5d]/20" />
      </div>

      {/* ── FEATURES ─────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-8 py-20">
        <div className="text-center mb-16">
          <p className="text-[#a62d5d] text-xs tracking-[0.4em] uppercase mb-4">Everything You Need</p>
          <h2 className="text-4xl font-bold text-[#0b132b]" style={{ fontFamily: 'Playfair Display, serif' }}>
            Crafted for <span className="italic text-[#a62d5d]">Craftsmen</span>
          </h2>
          <p className="text-[#475569] mt-4 max-w-lg mx-auto" style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.1rem' }}>
            Every feature was designed around the real workflows of tailoring establishments.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => (
            <div key={i} className="group border border-[#a62d5d]/10 bg-white p-6 hover:border-[#a62d5d]/40 hover:bg-[#fff8fa]/40 transition-all duration-500 relative overflow-hidden shadow-sm">
              <div className="absolute top-0 left-0 w-0 h-0.5 bg-[#a62d5d] group-hover:w-full transition-all duration-500" />
              <div className="h-10 w-10 flex items-center justify-center border border-[#a62d5d]/20 bg-slate-50 mb-4 group-hover:bg-[#a62d5d]/10 transition-colors">
                <f.icon size={18} className="text-[#a62d5d]" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-[#0b132b]" style={{ fontFamily: 'Playfair Display, serif' }}>{f.title}</h3>
              <p className="text-[#64748b] text-sm leading-relaxed" style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1rem' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────────────── */}
      <section className="bg-[#fff8fa] border-y border-[#a62d5d]/10 py-20 px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-[#a62d5d] text-xs tracking-[0.4em] uppercase mb-4">Testimonials</p>
            <h2 className="text-4xl font-bold text-[#0b132b]" style={{ fontFamily: 'Playfair Display, serif' }}>
              Words from Our <span className="italic text-[#a62d5d]">Patrons</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="border border-[#a62d5d]/10 bg-white p-7 relative shadow-sm">
                <div className="text-5xl text-[#a62d5d]/20 font-serif leading-none mb-4">"</div>
                <p className="text-[#475569] leading-relaxed mb-6 italic"
                  style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.05rem' }}>
                  {t.text}
                </p>
                <div className="border-t border-[#a62d5d]/10 pt-4">
                  <div className="font-semibold text-[#0b132b] text-sm" style={{ fontFamily: 'Playfair Display, serif' }}>{t.name}</div>
                  <div className="text-[#a62d5d] text-xs tracking-wider mt-0.5">{t.shop}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────── */}
      <section className="py-24 px-8 text-center relative overflow-hidden bg-white">
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'radial-gradient(circle at center, #a62d5d 0%, transparent 70%)' }} />
        <div className="relative max-w-2xl mx-auto">
          <div className="text-[#a62d5d] text-4xl mb-4">✦</div>
          <h2 className="text-4xl sm:text-5xl font-bold mb-6 text-[#0b132b]" style={{ fontFamily: 'Playfair Display, serif' }}>
            Ready to Elevate<br />
            <span className="italic text-[#a62d5d]">Your Craft?</span>
          </h2>
          <p className="text-[#475569] mb-10 text-lg" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
            Join hundreds of tailoring establishments. Start your 14-day free trial — no credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register"
              className="inline-flex items-center justify-center gap-3 bg-[#a62d5d] text-white px-10 py-4 text-sm tracking-widest uppercase font-bold hover:bg-[#c84b7c] transition-all shadow-lg shadow-[#a62d5d]/10">
              Start Free Trial
              <ChevronRight size={16} />
            </Link>
            <Link to="/login"
              className="inline-flex items-center justify-center gap-3 border border-[#a62d5d]/40 text-[#a62d5d] px-10 py-4 text-sm tracking-widest uppercase hover:bg-[#a62d5d]/5 transition-all">
              Access My Shop
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────── */}
      <footer className="border-t border-[#a62d5d]/10 py-8 px-8 text-center bg-white">
        <div className="flex items-center justify-center gap-3 mb-3">
          <Scissors size={14} className="text-[#a62d5d]" />
          <span className="text-sm tracking-[0.3em] uppercase text-[#64748b]">TailorSaaS</span>
          <Scissors size={14} className="text-[#a62d5d] scale-x-[-1]" />
        </div>
        <p className="text-[#94a3b8] text-xs tracking-wide">
          © {new Date().getFullYear()} TailorSaaS · Clean Modern Redesign · All rights reserved
        </p>
      </footer>

    </div>
  )
}
