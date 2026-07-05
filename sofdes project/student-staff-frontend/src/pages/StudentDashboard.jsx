import { Link } from 'react-router-dom';
import { Bell, ClipboardCheck, FilePlus2, PackageOpen, Search } from 'lucide-react';
import { currentStudent, foundItems, lostReports, notifications } from '../data/mockData';
import { PageHeader, PrimaryLink, SectionCard, StatCard, StatusBadge } from '../components/ui';

export default function StudentDashboard() {
  const activeLostReports = lostReports.filter((report) => report.status !== 'Returned');
  const possibleMatches = lostReports.filter((report) => report.status === 'Possible Match');

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Student dashboard"
        title={`Welcome back, ${currentStudent.name.split(' ')[0]}`}
        description="Track reports, review possible matches, and start a claim when an item appears to be yours."
        action={<PrimaryLink to="/report-lost" icon={FilePlus2}>Report lost item</PrimaryLink>}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Active lost reports" value={activeLostReports.length} icon={Search} tone="blue" detail="Across student-owned reports" />
        <StatCard label="Possible matches" value={possibleMatches.length} icon={ClipboardCheck} tone="green" detail="Awaiting claim review" />
        <StatCard label="Available found items" value={foundItems.filter((item) => item.status === 'Available').length} icon={PackageOpen} tone="amber" detail="Posted by campus offices" />
        <StatCard label="Unread notices" value={notifications.filter((note) => note.status === 'Unread').length} icon={Bell} tone="rose" detail="Recent updates" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <SectionCard title="My Lost Reports" subtitle="Recent items reported by the signed-in student">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase tracking-[0.12em] text-slate-500">
                  <th className="pb-3 font-semibold">Report</th>
                  <th className="pb-3 font-semibold">Location</th>
                  <th className="pb-3 font-semibold">Date</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {lostReports.map((report) => (
                  <tr key={report.id}>
                    <td className="py-4">
                      <p className="font-semibold text-campus-ink">{report.title}</p>
                      <p className="text-xs text-slate-500">{report.id} - {report.category}</p>
                    </td>
                    <td className="py-4 text-slate-600">{report.location}</td>
                    <td className="py-4 text-slate-600">{report.lostDate}</td>
                    <td className="py-4"><StatusBadge value={report.status} /></td>
                    <td className="py-4">
                      <Link to={`/lost-reports/${report.id}`} className="font-semibold text-campus-green hover:text-teal-800">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>

        <SectionCard title="Recent Notifications" subtitle="Latest claim and item activity" action={<Link to="/notifications" className="text-sm font-semibold text-campus-green">View all</Link>}>
          <div className="space-y-3">
            {notifications.slice(0, 3).map((note) => (
              <Link key={note.id} to={note.route} className="block rounded-md border border-slate-200 p-4 hover:border-campus-green/40 hover:bg-campus-mist/50">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-campus-ink">{note.title}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-600">{note.message}</p>
                  </div>
                  <StatusBadge value={note.status} />
                </div>
                <p className="mt-3 text-xs font-medium text-slate-500">{note.time}</p>
              </Link>
            ))}
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Found Items Near Your Reports" subtitle="Suggestions based on item category and campus location">
        <div className="grid gap-4 md:grid-cols-3">
          {foundItems.slice(0, 3).map((item) => (
            <div key={item.id} className="rounded-lg border border-slate-200 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-campus-ink">{item.title}</p>
                  <p className="mt-1 text-sm text-slate-500">{item.location}</p>
                </div>
                <StatusBadge value={item.status} />
              </div>
              <div className="mt-4 flex items-center justify-between gap-3">
                <span className="text-sm text-slate-500">{item.foundDate}</span>
                <Link to="/claim" className="text-sm font-semibold text-campus-green">Start claim</Link>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
