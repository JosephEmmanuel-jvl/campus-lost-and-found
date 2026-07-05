import { Link } from 'react-router-dom';
import { BellRing, Megaphone } from 'lucide-react';
import { notifications } from '../data/mockData';
import { PageHeader, SectionCard, StatCard, StatusBadge } from '../components/ui';

export default function Notifications() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Message center"
        title="Notifications"
        description="Campus lost-and-found updates, claim decisions, and office announcements."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Unread" value={notifications.filter((note) => note.status === 'Unread').length} icon={BellRing} tone="rose" />
        <StatCard label="Claim updates" value={notifications.filter((note) => note.type === 'Claim').length} icon={Megaphone} tone="blue" />
        <StatCard label="This week" value={notifications.length} icon={BellRing} tone="green" />
      </div>

      <SectionCard title="Recent notifications">
        <div className="divide-y divide-slate-100">
          {notifications.map((note) => (
            <Link key={note.id} to={note.route} className="flex flex-col gap-3 py-5 first:pt-0 last:pb-0 md:flex-row md:items-center md:justify-between">
              <div className="flex gap-4">
                <div className={`mt-1 h-3 w-3 rounded-full ${note.status === 'Unread' ? 'bg-campus-green' : 'bg-slate-300'}`} />
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-bold text-campus-ink">{note.title}</h2>
                    <StatusBadge value={note.type} />
                  </div>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{note.message}</p>
                  <p className="mt-2 text-xs font-medium text-slate-500">{note.time}</p>
                </div>
              </div>
              <StatusBadge value={note.status} />
            </Link>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
