import { Link } from 'react-router-dom';
import { ClipboardCheck, PackageOpen, Search, ShieldCheck } from 'lucide-react';
import { claimRequests, foundItems, lostReports, notifications, offices } from '../data/mockData';
import { PageHeader, PrimaryLink, SectionCard, StatCard, StatusBadge } from '../components/ui';

export default function StaffMenu() {
  const pendingClaims = claimRequests.filter((claim) => claim.status !== 'Approved');

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Staff"
        title="Staff Menu"
        description="Found item intake, student report lookup, and claim handoff tools for campus staff."
        action={<PrimaryLink to="/report-found" icon={PackageOpen}>Record found item</PrimaryLink>}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Found items" value={foundItems.length} icon={PackageOpen} tone="green" detail="Current visible records" />
        <StatCard label="Lost reports" value={lostReports.length} icon={Search} tone="blue" detail="Searchable student reports" />
        <StatCard label="Pending claims" value={pendingClaims.length} icon={ClipboardCheck} tone="amber" detail="Awaiting staff review" />
        <StatCard label="Unread notices" value={notifications.filter((note) => note.status === 'Unread').length} icon={ShieldCheck} tone="rose" detail="New updates" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <SectionCard title="Found item intake" subtitle="Recently recorded items and their holding offices">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase tracking-[0.12em] text-slate-500">
                  <th className="pb-3 font-semibold">Item</th>
                  <th className="pb-3 font-semibold">Location</th>
                  <th className="pb-3 font-semibold">Office</th>
                  <th className="pb-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {foundItems.slice(0, 5).map((item) => (
                  <tr key={item.id}>
                    <td className="py-4">
                      <p className="font-semibold text-campus-ink">{item.title}</p>
                      <p className="text-xs text-slate-500">{item.id} - {item.category}</p>
                    </td>
                    <td className="py-4 text-slate-600">{item.location}</td>
                    <td className="py-4 text-slate-600">{item.intakeOffice}</td>
                    <td className="py-4"><StatusBadge value={item.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>

        <div className="space-y-6">
          <SectionCard title="Quick actions">
            <div className="grid gap-3">
              <PrimaryLink to="/report-found" icon={PackageOpen}>Record found item</PrimaryLink>
              <Link to="/search" className="rounded-md border border-slate-300 px-4 py-2.5 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50">
                Search all records
              </Link>
              <Link to="/notifications" className="rounded-md border border-slate-300 px-4 py-2.5 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50">
                Review notifications
              </Link>
            </div>
          </SectionCard>

          <SectionCard title="Holding offices">
            <div className="space-y-3">
              {offices.map(([office, count, location]) => (
                <div key={office} className="rounded-md border border-slate-200 p-3">
                  <p className="font-semibold text-campus-ink">{office}</p>
                  <p className="mt-1 text-sm text-slate-500">{count} - {location}</p>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
