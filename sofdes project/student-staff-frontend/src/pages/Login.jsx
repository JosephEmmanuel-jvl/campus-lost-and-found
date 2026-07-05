import { Link } from 'react-router-dom';
import { ArrowRight, BadgeCheck, Building2, MapPin, ShieldCheck } from 'lucide-react';

export default function Login() {
  return (
    <main className="min-h-screen bg-[#eef5f3] px-6 py-8 text-campus-ink">
      <section className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="py-8">
          <div className="mb-8 inline-flex items-center gap-3 rounded-full border border-campus-green/20 bg-white px-4 py-2 text-sm font-semibold text-campus-green shadow-sm">
            <Building2 className="h-4 w-4" />
            6NF
          </div>
          <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-normal md:text-6xl">
            6NF Lost & Found
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
            Report lost belongings, review found items from campus offices, and follow claim updates from one organized portal.
          </p>
          <div className="mt-8 grid max-w-2xl gap-3 sm:grid-cols-3">
            {[
              ['8', 'Campus offices'],
              ['42', 'June reports'],
              ['91%', 'Returned items'],
            ].map(([value, label]) => (
              <div key={label} className="rounded-lg border border-white bg-white/80 p-4 shadow-sm">
                <p className="text-2xl font-bold">{value}</p>
                <p className="mt-1 text-sm text-slate-500">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-white bg-white p-7 shadow-soft">
          <div className="mb-7">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-campus-green">Student access</p>
            <h2 className="mt-2 text-2xl font-bold">Sign in</h2>
          </div>
          <div className="space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">University email</span>
              <input name="email" className="mt-2 w-full rounded-md border border-slate-300 px-4 py-3 outline-none focus:border-campus-green focus:ring-2 focus:ring-campus-green/20" placeholder="name@university.edu" />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Password</span>
              <input name="password" className="mt-2 w-full rounded-md border border-slate-300 px-4 py-3 outline-none focus:border-campus-green focus:ring-2 focus:ring-campus-green/20" type="password" placeholder="Enter password" />
            </label>
            <Link to="/dashboard" className="flex w-full items-center justify-center gap-2 rounded-md bg-campus-green px-4 py-3 font-semibold text-white hover:bg-teal-800">
              Continue
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-7 grid gap-3">
            {[
              [ShieldCheck, 'Campus Safety manages verified pickup releases.'],
              [MapPin, 'Reports route to the office closest to the found location.'],
              [BadgeCheck, 'Claims include identity and item-specific verification.'],
            ].map(([Icon, text]) => (
              <div key={text} className="flex items-start gap-3 rounded-md bg-slate-50 p-3 text-sm text-slate-600">
                <Icon className="mt-0.5 h-4 w-4 shrink-0 text-campus-green" />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
