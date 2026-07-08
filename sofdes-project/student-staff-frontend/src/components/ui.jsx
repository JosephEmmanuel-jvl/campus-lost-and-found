import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import {
  BookOpen,
  CheckCircle2,
  CircleAlert,
  Clock3,
  FileSearch,
  IdCard,
  Laptop,
  PackageCheck,
  PackageOpen,
  ShieldCheck,
  Trophy,
  Watch,
} from 'lucide-react';

const badgeStyles = {
  Open: 'bg-sky-50 text-sky-700 ring-sky-200',
  'Under Review': 'bg-amber-50 text-amber-700 ring-amber-200',
  'Possible Match': 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  Available: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  'In Review': 'bg-amber-50 text-amber-700 ring-amber-200',
  'Claim Pending': 'bg-indigo-50 text-indigo-700 ring-indigo-200',
  Returned: 'bg-slate-100 text-slate-600 ring-slate-200',
  'Needs Review': 'bg-rose-50 text-rose-700 ring-rose-200',
  'Pending Review': 'bg-amber-50 text-amber-700 ring-amber-200',
  Approved: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  Unread: 'bg-campus-green text-white ring-campus-green',
  Read: 'bg-slate-100 text-slate-600 ring-slate-200',
  High: 'bg-rose-50 text-rose-700 ring-rose-200',
  Normal: 'bg-slate-100 text-slate-600 ring-slate-200',
  Match: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  Claim: 'bg-sky-50 text-sky-700 ring-sky-200',
  Student: 'bg-campus-mist text-campus-green ring-campus-green/20',
  Staff: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
  'Lost Report': 'bg-sky-50 text-sky-700 ring-sky-200',
  'Found Item': 'bg-amber-50 text-amber-700 ring-amber-200',
  Campus: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
};

const thumbnailMap = {
  laptop: { Icon: Laptop, bg: 'from-slate-800 via-slate-600 to-teal-500', label: 'Laptop' },
  bottle: { Icon: Watch, bg: 'from-teal-600 via-cyan-500 to-sky-300', label: 'Bottle' },
  headphones: { Icon: PackageOpen, bg: 'from-zinc-800 via-zinc-600 to-slate-400', label: 'Headphones' },
  ring: { Icon: Trophy, bg: 'from-amber-500 via-yellow-300 to-stone-100', label: 'Ring' },
  id: { Icon: IdCard, bg: 'from-blue-700 via-sky-500 to-white', label: 'Badge holder' },
};

export function StatusBadge({ value }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${badgeStyles[value] || 'bg-slate-100 text-slate-600 ring-slate-200'}`}>
      {value}
    </span>
  );
}

export function PageHeader({ eyebrow, title, description, action }) {
  return (
    <div className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
      <div>
        {eyebrow ? <p className="text-sm font-semibold uppercase tracking-[0.16em] text-campus-green">{eyebrow}</p> : null}
        <h1 className="mt-2 text-3xl font-bold tracking-normal text-campus-ink">{title}</h1>
        {description ? <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function StatCard({ label, value, icon: Icon, tone = 'green', detail }) {
  const toneClasses = {
    green: 'bg-campus-mist text-campus-green',
    blue: 'bg-sky-50 text-sky-700',
    amber: 'bg-amber-50 text-amber-700',
    rose: 'bg-rose-50 text-rose-700',
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-bold text-campus-ink">{value}</p>
        </div>
        {Icon ? (
          <div className={`flex h-11 w-11 items-center justify-center rounded-md ${toneClasses[tone]}`}>
            <Icon className="h-5 w-5" />
          </div>
        ) : null}
      </div>
      {detail ? <p className="mt-4 text-sm text-slate-500">{detail}</p> : null}
    </div>
  );
}

const categoryMap = {
  electronics: 'laptop',
  gadgets: 'laptop',
  'personal belongings': 'bottle',
  clothing: 'headphones',
  documents: 'id',
  others: 'ring',
};

export function ItemThumbnail({ type = 'laptop', category, photoUrl, className = '' }) {
  const normalizedCategory = (category || '').toLowerCase().trim();
  const categoryKey = categoryMap[normalizedCategory] || type || 'laptop';
  const item = thumbnailMap[categoryKey] || thumbnailMap.laptop;
  const labelText = category || item.label;

  const fullPhotoUrl = photoUrl && photoUrl.startsWith('/') && !photoUrl.startsWith('//')
    ? `${API_BASE_URL}${photoUrl}`
    : photoUrl;

  return (
    <div className={`relative flex min-h-40 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br ${item.bg} ${className}`}>
      {photoUrl ? (
        <img 
          src={fullPhotoUrl} 
          alt={labelText} 
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <>
          <div className="absolute inset-4 rounded-md border border-white/30 bg-white/10" />
          <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-white/90 text-campus-ink shadow-soft">
            <item.Icon className="h-10 w-10" />
          </div>
        </>
      )}
      <span className="absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-campus-ink">
        {labelText}
      </span>
    </div>
  );
}

export function SectionCard({ title, subtitle, children, action }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-200 p-5 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-bold text-campus-ink">{title}</h2>
          {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
        </div>
        {action ? <div>{action}</div> : null}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

export function PrimaryLink({ to, children, icon: Icon }) {
  return (
    <Link to={to} className="inline-flex items-center justify-center gap-2 rounded-md bg-campus-green px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-teal-800">
      {Icon ? <Icon className="h-4 w-4" /> : null}
      {children}
    </Link>
  );
}

export function SecondaryLink({ to, children, icon: Icon }) {
  return (
    <Link to={to} className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
      {Icon ? <Icon className="h-4 w-4" /> : null}
      {children}
    </Link>
  );
}

export function EmptyState({ title, message }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
      <FileSearch className="mx-auto h-9 w-9 text-slate-400" />
      <h3 className="mt-3 font-semibold text-campus-ink">{title}</h3>
      <p className="mt-1 text-sm text-slate-500">{message}</p>
    </div>
  );
}

export function ReviewChecklist() {
  const items = [
    ['Report details checked', CheckCircle2, 'text-emerald-600'],
    ['Ownership evidence pending', Clock3, 'text-amber-600'],
    ['Sensitive details hidden', ShieldCheck, 'text-sky-600'],
    ['Pickup office assigned', PackageCheck, 'text-campus-green'],
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {items.map(([label, Icon, tone]) => (
        <div key={label} className="flex items-center gap-3 rounded-md border border-slate-200 bg-slate-50 p-3">
          <Icon className={`h-5 w-5 ${tone}`} />
          <span className="text-sm font-medium text-slate-700">{label}</span>
        </div>
      ))}
    </div>
  );
}

export function AlertStrip({ children }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
      <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
      <p>{children}</p>
    </div>
  );
}

export function FormField({ label, children }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <div className="mt-2">{children}</div>
    </label>
  );
}

export const inputClasses =
  'w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-campus-ink outline-none focus:border-campus-green focus:ring-2 focus:ring-campus-green/20';

export const selectClasses = inputClasses;

export const textareaClasses =
  'min-h-28 w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-campus-ink outline-none focus:border-campus-green focus:ring-2 focus:ring-campus-green/20';

export function MiniTimeline({ events }) {
  return (
    <ol className="space-y-4">
      {events.map(([date, label]) => (
        <li key={`${date}-${label}`} className="flex gap-3">
          <div className="mt-1 h-2.5 w-2.5 rounded-full bg-campus-green" />
          <div>
            <p className="text-sm font-semibold text-campus-ink">{label}</p>
            <p className="text-sm text-slate-500">{date}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

export function OfficeIcon({ index }) {
  const icons = [ShieldCheck, BookOpen, PackageOpen, Trophy];
  const Icon = icons[index % icons.length];
  return <Icon className="h-5 w-5 text-campus-green" />;
}
